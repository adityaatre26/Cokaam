"use client";
import { useParams } from "next/navigation";

function page() {
  const params = useParams();
  const { id } = params;
  return (
    <div>
      <h1>User ID: {id}</h1>
    </div>
  );
}
export default page;
