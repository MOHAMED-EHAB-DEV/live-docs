import Loader from "@/components/Loader";

export default function Loading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <Loader text="Loading account settings..." size={32} />
    </div>
  );
}
