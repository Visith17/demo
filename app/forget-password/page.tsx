// app/forget-password/page.tsx (Server Component)
import Image from "next/image";
import ForgetPasswordClient from "./ForgetPasswordClient";

export const dynamic = "force-dynamic";

export default function ForgetPasswordPage() {
  return (
    <div className="w-full lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center justify-center">
            <Image
              src="/login-main-logo.png"
              alt="Main logo"
              width={150}
              height={100}
              className="h-full w-[150px] object-cover dark:brightness-[0.2] dark:grayscale w-auto"
              priority
            />
          </div>

          <ForgetPasswordClient />
        </div>
      </div>

      <div className="hidden bg-muted lg:block">
        <Image
          src="/login-img.png"
          alt="Login background"
          width={1920}
          height={1080}
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
