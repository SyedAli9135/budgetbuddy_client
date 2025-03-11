"use client"

import React, { useEffect, useState } from "react"
import { redirect } from "next/navigation"

const Protected: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [isAuthenticated, setisAuthenticated] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem("access_token")
        setisAuthenticated(!!token)
        setIsLoaded(true)
    }, [])

    if(!isLoaded) return <>loading....</>
    if(!isAuthenticated) {
        redirect("/login")
    }
    return children
}

export default Protected
