import Link from "next/link";

export default function NotFound() {
  return (
    <div className="cc-page bg-bg text-fg min-h-screen pl-[2rem] pr-[2rem] pt-[1.6875rem] pb-[5rem]">
      <div className="flex flex-col gap-[2.25rem] w-full">
        <h1 className="text-[4.5rem] leading-[1.05] tracking-[-0.03em] text-fg font-normal">
          Page not found
        </h1>
        <p className="text-[2rem] leading-[1.25] tracking-[-0.02em] text-fg max-w-[79rem]">
          The page you are looking for could not be located.
        </p>
        <Link
          href="/"
          className="inline-flex w-fit items-center justify-center px-[0.625rem] py-[0.375rem] border border-fg text-fg bg-bg text-[1.25rem] tracking-[-0.02em] leading-none hover:bg-accent hover:text-accent-fg"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
