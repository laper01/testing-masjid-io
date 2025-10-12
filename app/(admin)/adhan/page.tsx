import PageTitle from '@/components/PageTitle'
import { Button } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import AdhanManagementTable from '@/components/adhan/AdhanManagementTable'


const Page = () => {
    return (
        <>
            <PageTitle title="Adhan Management" />
            <AdhanManagementTable />
        </>
    )
}
export default Page
