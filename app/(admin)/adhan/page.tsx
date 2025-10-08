import PageTitle from '@/components/PageTitle'
import { Button } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import AdhanManagementTable from './components/AdhanManagementTable'


const Page = () => {
    return (
        <>
            <PageTitle title="Adhan Management" />
            <Link href="/adhan/create" className="d-flex justify-content-end">
                <Button variant="success " className="fs-16 flex-centered gap-1 mb-4" id="btn-new-event">
                    <IconifyIcon icon="ic:baseline-person-add" /> Add new Adhan sound
                </Button>
            </Link>
            <AdhanManagementTable />
        </>
    )
}
export default Page
