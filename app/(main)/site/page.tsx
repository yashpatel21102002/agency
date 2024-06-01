import Image from "next/image";


const page = () => {
  return (
    <>
      <section className="h-full w-full pt-36 md:pt-96 relative flex items-center justify-center flex-col">
        {/* It will give the grid like appearance in the background */}
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <p className="text-xl dark:text-zinc-400 text-zinc-900 text-center">Run your agency, in one place</p>
        <div className="bg-gradient-to-r from-primary to-secondary-foreground text-transparent bg-clip-text relative">
            <h1 className="text-9xl font-bold text-center md:text-[150px]">
                Agency
            </h1>
        </div>
        <div className="flex justify-center items-center relative">
            <Image src={"/assets/preview.png"} alt="banner image" height={1200} width={1200} className="rounded-tl-2xl rounded-tr-2xl border-2 border-muted"/>
            <div className="bottom-0 top-[50%] bg-gradient-to-t dark:from-background left-0 right-0 absoulte z-10"></div>
        </div>
      </section>
    </>
  );
};

export default page;
