import Image from "next/image";

export default function CircularLoading() {
  return (
    <section className="flex justify-center items-center">
      <div>
        <Image
          src="./spinner.svg"
          alt="spinner"
          width={56}
          height={56}
          className="object-contain"
        />
      </div>
    </section>
  );
}
