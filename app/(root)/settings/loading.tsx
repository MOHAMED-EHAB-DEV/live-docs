import Loader from "@/components/Loader";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[70vh] w-full">
      <Loader text="Loading account settings..." size={32} />
    </div>
  );
}
