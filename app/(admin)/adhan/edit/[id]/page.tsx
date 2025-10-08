'use client';
import PageTitle from "@/components/PageTitle";
import { useParams } from "next/navigation";
import UpdateAdhanForm from "../../components/UpdateAdhanForm";



export default function Page() {
    const params = useParams()
    const adhanId = params.id as string
  return (
    <>
      <PageTitle title="Edit Adhan" />
      <div className="max-w-3xl mx-auto p-4">
        <UpdateAdhanForm adhanId={adhanId} />
      </div>
      </>
  )
}
