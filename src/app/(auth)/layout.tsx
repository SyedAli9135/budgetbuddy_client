import React from "react"

import NoAuth from "@/components/NoAuth"

export default function NoAuthLayout({
    children
}: { children: React.ReactNode }) {
    return (
        <NoAuth>
            {children}
        </NoAuth>
    )
}
