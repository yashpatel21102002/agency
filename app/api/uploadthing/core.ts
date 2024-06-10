import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { auth } from '@clerk/nextjs/server'

const f = createUploadthing()

const authenticateUser = () => {
    const user = auth();
    //if you throw, the user will not able to upload 
    if (!user) {
        throw new Error('UnAuthorized!');
    }
    //whatever is returned here is accessible in onUploadComplete as metadata.
    return user;
}

//File Router for app, can contain multiple Fileroutes
export const ourFileRouter = {
    //define as many fileroutes as you liek, each with a unique routeslug
    subaccountLogo: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
        .middleware(authenticateUser)
        .onUploadComplete(() => { }),
    avatar: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
        .middleware(authenticateUser)
        .onUploadComplete(() => { }),
    agencyLogo: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
        .middleware(authenticateUser)
        .onUploadComplete(() => { }),
    media: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
        .middleware(authenticateUser)
        .onUploadComplete(() => { })
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter;

