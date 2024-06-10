'use server'

//we will define all the server actions here...
//server actions - if when server is sending request to it self it is known as server actions. 
//so when we will call api to get the data, but from the server itself -> it is time consuming task and it makes no sense to call oneself to get the data 
//in the case of next here frontend/backend on the same server so using server actions makes more sense but you can also use axios.

import { clerkClient, currentUser } from '@clerk/nextjs/server'
import prisma from './db'
import { Agency, Plan, User } from '@prisma/client'
import { userAgent } from 'next/server'

export const getAuthUserDetails = async () => {

    //get the logged in user.
    const user = await currentUser()

    if (!user) {
        return;
    }

    const userData = await prisma.user.findUnique({
        where: {
            email: user.emailAddresses[0].emailAddress,
        },
        include: {
            Agency: {
                include: {
                    SidebarOption: true,
                    SubAccount: {
                        include: { SidebarOption: true },
                    }
                }
            },
            Permissions: true,
        }
    })

    return userData;
}

export const createTeamUser = async (agencyId: string, user: User) => {
    if (user.role === 'AGENCY_OWNER') return null;

    const response = await prisma.user.create({
        data: { ...user }
    })

    return response;
}

export const saveActivityLogsNotification = async ({ agencyId, description, subaccountId }: { agencyId?: string, description: string, subaccountId?: string }) => {
    const authUser = await currentUser();

    let userData;

    if (!authUser) {
        const response = await prisma.user.findFirst({
            where: {
                Agency: { SubAccount: { some: { id: subaccountId } } }
            }
        })

        if (response) {
            userData = response;
        }
    } else {
        userData = await prisma.user.findUnique({
            where: {
                email: authUser.emailAddresses[0].emailAddress
            }
        })
    }

    if (!userData) {
        console.log("Couldn't find the user")
        return;
    }

    let foundAgencyId = agencyId
    if (!foundAgencyId) {
        if (!subaccountId) {
            throw new Error(
                'You need to provide atleast an agency Id or Subaccount Id'
            )
        }

        const response = await prisma.subAccount.findUnique({
            where: { id: subaccountId },
        })
        if (response) {
            foundAgencyId = response.agencyId
        }
    }
    if (subaccountId) {
        await prisma.notification.create({
            data: {
                notification: `${userData.name} | ${description}`,
                User: {
                    connect: {
                        id: userData.id
                    },
                },
                Agency: {
                    connect: {
                        id: foundAgencyId
                    },
                },
                SubAccount: {
                    connect: { id: subaccountId },
                },
            },

        })
    } else {
        await prisma.notification.create({
            data: {
                notification: `${userData.name} | ${description}`,
                User: {
                    connect: {
                        id: userData.id,
                    },
                },
                Agency: {
                    connect: {
                        id: foundAgencyId
                    }
                }
            }
        })
    }
}

export const verifyAndAcceptInvitation = async () => {

    const user = await currentUser();

    if (!user) {
        return;
    }

    const invitationExists = await prisma.invitation.findUnique({
        where: {
            email: user.emailAddresses[0].emailAddress,
            status: 'PENDING',
        }
    })


    if (invitationExists) {
        const userDetails = await createTeamUser(invitationExists.agencyId, {
            email: invitationExists.email,
            agencyId: invitationExists.agencyId,
            avatarUrl: user.imageUrl,
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            role: invitationExists.role,
            createdAt: new Date(),
            updatedAt: new Date(),
        })

        await saveActivityLogsNotification({
            agencyId: invitationExists?.agencyId,
            description: 'Joined',
            subaccountId: undefined,
        })

        if (userDetails) {
            await clerkClient.users.updateUserMetadata(user.id, {
                privateMetadata: {
                    role: userDetails.role || "SUBACCOUNT_USER",
                }
            })

            await prisma.invitation.delete({
                where: { email: userDetails.email }
            })

            return userDetails.agencyId
        } else {
            return null
        }
    } else {
        const agency = await prisma.user.findUnique({
            where: {
                email: user.emailAddresses[0].emailAddress,
            },
        })
        return agency ? agency.agencyId : null;
    }





}


export const updateAgencyDetails = async (agencyId: string, agencyDetails: Partial<Agency>) => {
    const response = await prisma.agency.update({
        where: {
            id: agencyId,

        },
        data: { ...agencyDetails }
    })

    return response;
}

//It will delete the agency with the subsciptions
export const deleteAgency = async (agencyId: string) => {
    const response = await prisma.agency.delete({
        where: {
            id: agencyId,
        }

    })
    return response;
}


export const initUser = async (newUser: Partial<User>) => {
    const user = await currentUser()

    if (!user) return;

    const userData = await prisma.user.upsert({
        where: {
            email: user.emailAddresses[0].emailAddress
        },
        update: newUser,
        create: {
            id: user.id,
            avatarUrl: user.imageUrl,
            email: user.emailAddresses[0].emailAddress,
            name: `${user.firstName} ${user.lastName}`,
            role: newUser.role || 'SUBACCOUNT_USER',
        }
    })

    await clerkClient.users.updateUserMetadata(user.id, {
        privateMetadata: {
            role: newUser.role || 's'
        }
    })

    return userData;

}

//upsert agency ( insert + update = if exist then update else insert )
export const upsertAgency = async (agency: Agency, price?: Plan) => {
    if (!agency.companyEmail) return null;

    //try catch
    try {
        const agencyDetails = await prisma.agency.upsert({
            where: {
                id: agency.id,
            },
            update: agency,
            create: {
                users: {
                    connect: {
                        email: agency.companyEmail
                    }
                },
                ...agency,
                SidebarOption: {
                    create: [
                        {
                            name: 'Dashboard',
                            icon: 'category',
                            link: `/agency/${agency.id}`,
                        },
                        {
                            name: 'Launchpad',
                            icon: 'clipboardIcon',
                            link: `/agency/${agency.id}/launchpad`,
                        },
                        {
                            name: 'Billing',
                            icon: 'payment',
                            link: `/agency/${agency.id}/billing`,
                        },
                        {
                            name: 'Settings',
                            icon: 'settings',
                            link: `/agency/${agency.id}/settings`,
                        },
                        {
                            name: 'Sub Accounts',
                            icon: 'person',
                            link: `/agency/${agency.id}/all-subaccounts`,
                        },
                        {
                            name: 'Team',
                            icon: 'shield',
                            link: `/agency/${agency.id}/team`,
                        },
                    ],
                },
            }
        })
        return agencyDetails;
    } catch (e) {
        console.log("Error", e);
    }
}