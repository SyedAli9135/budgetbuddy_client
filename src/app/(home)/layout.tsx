import Protected from "@/components/Protected"

export default function AuthLayout({
    children
}: { children: React.ReactNode }) {

    return <Protected>
        {children}
    </Protected>
}
