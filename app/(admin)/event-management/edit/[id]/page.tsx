'use client';
import PageTitle from "@/components/PageTitle";
import EditEventForm from "../../components/EditEventForm";
import { useParams } from "next/navigation";



export default function page() {
    const params = useParams()
    const eventId = params.id as string
  return (
    <>
      <PageTitle title="Create new event" />
      <div className="max-w-3xl mx-auto p-4">
        <EditEventForm eventId={eventId} />
      </div>
      </>
  )
}
