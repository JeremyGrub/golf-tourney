import HostChrome from "@/components/host/HostChrome";

// HostChrome lives inside the dashboard page (not in a parent layout), so the
// loading state needs its own copy to keep the topbar painted.
export default function DashboardLoading() {
  return (
    <HostChrome email={null}>
      <div className="mx-auto w-full max-w-[1280px] px-6 py-12 md:px-10 md:py-16">
        <div className="mb-10 flex flex-col items-start justify-between gap-6 md:mb-14 md:flex-row md:items-end">
          <div className="flex flex-col gap-3">
            <div className="cm-skel h-3 w-44" />
            <div className="cm-skel h-12 w-56 rounded-md md:h-14 md:w-72" />
          </div>
          <div className="cm-skel h-12 w-44 rounded-full" />
        </div>

        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <li
              key={i}
              className="rounded-3xl border border-ink/10 bg-chalk p-6"
              style={{ opacity: 1 - i * 0.1 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="cm-skel h-5 w-14 rounded-full" />
                <div className="cm-skel h-3 w-16" />
              </div>
              <div className="cm-skel mb-2 h-7 w-3/4 rounded-md" />
              <div className="cm-skel h-3 w-1/2" />
              <div className="mt-8 flex items-center justify-between">
                <div className="cm-skel h-3 w-24" />
                <div className="cm-skel h-3 w-3" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </HostChrome>
  );
}
