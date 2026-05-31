"use client"

import {
    BadgeCheck,
    Bell,
    ChevronsUpDown,
    CreditCard,
    LogOut,
    Sparkles,
} from "lucide-react"
import { Avatar, Dropdown, Label, Separator } from "@heroui/react"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"

export function NavUser({
    user,
}: {
    user: {
        name: string
        email: string
        avatar: string
    }
}) {
    const { isMobile } = useSidebar()

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <Dropdown>
                    <SidebarMenuButton
                        size="lg"
                        className="data-[open=true]:bg-sidebar-accent data-[open=true]:text-sidebar-accent-foreground md:h-8 md:p-0"
                    >
                        <Avatar className="h-8 w-8 rounded-lg">
                            <Avatar.Image src={user.avatar} alt={user.name} />
                            <Avatar.Fallback className="rounded-lg">CN</Avatar.Fallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">{user.name}</span>
                            <span className="truncate text-xs">{user.email}</span>
                        </div>
                        <ChevronsUpDown className="ml-auto size-4" />
                    </SidebarMenuButton>
                    <Dropdown.Popover
                        className="min-w-56 rounded-lg"
                        placement={isMobile ? "bottom" : "right"}
                    >
                        <div className="p-1">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <Avatar.Image src={user.avatar} alt={user.name} />
                                    <Avatar.Fallback className="rounded-lg">CN</Avatar.Fallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{user.name}</span>
                                    <span className="truncate text-xs">{user.email}</span>
                                </div>
                            </div>
                        </div>
                        <Separator />
                        <Dropdown.Menu>
                            <Dropdown.Item id="upgrade" textValue="Upgrade to Pro">
                                <Sparkles />
                                <Label>Upgrade to Pro</Label>
                            </Dropdown.Item>
                            <Dropdown.Item id="account" textValue="Account">
                                <BadgeCheck />
                                <Label>Account</Label>
                            </Dropdown.Item>
                            <Dropdown.Item id="billing" textValue="Billing">
                                <CreditCard />
                                <Label>Billing</Label>
                            </Dropdown.Item>
                            <Dropdown.Item id="notifications" textValue="Notifications">
                                <Bell />
                                <Label>Notifications</Label>
                            </Dropdown.Item>
                            <Dropdown.Item id="logout" textValue="Log out" variant="danger">
                                <LogOut />
                                <Label>Log out</Label>
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown.Popover>
                </Dropdown>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
