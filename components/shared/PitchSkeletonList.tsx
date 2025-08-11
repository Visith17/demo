import SkeletonCard from "./SkeletonCard";

export default function PitchSkeletonList() {
  return (
    <div className="pb-20 md:pb-2">
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-4 mt-4">
        {[1, 2, 3, 4, 5, 6].map((index) => {
          return <SkeletonCard key={index} />;
        })}
      </div>
    </div>
  );
}