import type { ReactNode } from "react";
import { AdminLoginContent } from "@/app/admin/AdminLoginContent";

const LOGIN_BACKGROUND_IMAGE =
  "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=2400&q=80";

type AdminLoginPageProps = {
  isConfigured: boolean;
  showForm?: boolean;
  resetSuccess?: boolean;
  children?: ReactNode;
};

function BrandMark() {
  return (
    <span
      className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-black"
      aria-hidden="true"
    >
      <span
        className="h-5 w-5 rounded-[4px] bg-white"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 80%)" }}
      />
    </span>
  );
}

export function AdminLoginPage({
  isConfigured,
  showForm = true,
  resetSuccess = false,
  children,
}: AdminLoginPageProps) {
  return (
    <main
      className="relative flex min-h-dvh w-full flex-col overflow-hidden text-black md:block"
      data-lenis-prevent
    >
      <div
        className="relative h-44 shrink-0 bg-cover bg-center bg-no-repeat md:absolute md:inset-0 md:h-auto"
        style={{ backgroundImage: `url("${LOGIN_BACKGROUND_IMAGE}")` }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-neutral-900/25" />
      </div>

      <div className="relative flex flex-1 justify-end md:min-h-dvh">
        <section className="flex w-full max-w-xl flex-1 flex-col justify-center bg-white px-8 py-12 shadow-2xl sm:px-12 md:flex-none md:px-16 md:py-14 lg:max-w-[34rem] lg:px-20">
          <div className="mx-auto w-full max-w-sm">
            {showForm ? (
              <>
                <div className="flex justify-center">
                  <BrandMark />
                </div>

                <AdminLoginContent
                  isConfigured={isConfigured}
                  resetSuccess={resetSuccess}
                />
              </>
            ) : (
              <>
                <div className="flex justify-center">
                  <BrandMark />
                </div>
                <div className="mt-8">{children}</div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
