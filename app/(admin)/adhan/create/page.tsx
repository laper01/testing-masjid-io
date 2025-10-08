import PageTitle from "@/components/PageTitle";
import CreateAdhanForm from "../components/CreateAdhanForm";


export default function Page() {
  return (
    <>
      <PageTitle title="Add new Adhan sound file" />
      <div className="max-w-3xl mx-auto p-4">
        <CreateAdhanForm />
      </div>
      </>
  )
}
