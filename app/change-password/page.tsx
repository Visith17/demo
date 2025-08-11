import Image from "next/image";
import ChangePasswordForm from "./ChangePasswordForm";

interface Props {
  searchParams: { token?: string };
}

const ChangePasswordPage = ({ searchParams }: Props) => {
  const token = searchParams?.token;

  return (
    <div className="w-full lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center justify-center">
            <Image
              src="/login-main-logo.png"
              alt="Logo"
              width={150}
              height={100}
              className="object-cover dark:brightness-[0.2] dark:grayscale w-auto"
              priority
            />
          </div>
          <ChangePasswordForm token={token} />
        </div>
      </div>

      <div className="hidden bg-muted lg:block">
        <Image
          src="/login-img.png"
          alt="Illustration"
          width={1920}
          height={1080}
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
};

export default ChangePasswordPage;

export const dynamic = "force-dynamic";
