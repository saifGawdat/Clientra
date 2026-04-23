import { getSession } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Building2, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { DashboardChart } from "@/components/dashboard/dashboard-chart"
import Link from "next/link"

async function getDashboardData(userId: string) {
  const [
    totalContacts,
    totalCompanies,
    totalDeals,
    openDeals,
    wonDeals,
    recentContacts,
    recentDeals,
    activitiesThisWeek,
    dealsByStage,
  ] = await Promise.all([
    prisma.contact.count({ where: { ownerId: userId } }),
    prisma.company.count({ where: { ownerId: userId } }),
    prisma.deal.count({ where: { ownerId: userId } }),
    prisma.deal.aggregate({
      where: { ownerId: userId, stage: { notIn: ["WON", "LOST"] } },
      _sum: { value: true },
      _count: true,
    }),
    prisma.deal.aggregate({
      where: { ownerId: userId, stage: "WON" },
      _sum: { value: true },
      _count: true,
    }),
    prisma.contact.findMany({
      where: { ownerId: userId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { company: { select: { name: true } } },
    }),
    prisma.deal.findMany({
      where: { ownerId: userId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { contact: { select: { firstName: true, lastName: true } } },
    }),
    prisma.activity.count({
      where: {
        userId,
        scheduledAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.deal.groupBy({
      by: ["stage"],
      where: { ownerId: userId },
      _count: true,
      _sum: { value: true },
    }),
  ])

  return {
    totalContacts,
    totalCompanies,
    totalDeals,
    openDeals,
    wonDeals,
    recentContacts,
    recentDeals,
    activitiesThisWeek,
    dealsByStage,
  }
}

const stageColors: Record<string, string> = {
  LEAD: "secondary",
  QUALIFIED: "default",
  PROPOSAL: "warning",
  NEGOTIATION: "purple",
  WON: "success",
  LOST: "destructive",
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) return null
  const data = await getDashboardData(session.user.id)

  const stats = [
    {
      title: "Total Contacts",
      value: data.totalContacts,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Companies",
      value: data.totalCompanies,
      icon: Building2,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Open Pipeline",
      value: formatCurrency(data.openDeals._sum.value ?? 0),
      sub: `${data.openDeals._count} deals`,
      icon: TrendingUp,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Revenue Won",
      value: formatCurrency(data.wonDeals._sum.value ?? 0),
      sub: `${data.wonDeals._count} deals`,
      icon: ArrowUpRight,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ]

  const chartData = data.dealsByStage.map((s) => ({
    stage: s.stage,
    count: s._count,
    value: s._sum.value ?? 0,
  }))

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here&apos;s what&apos;s happening.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  {stat.sub && <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>}
                </div>
                <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Pipeline Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <DashboardChart data={chartData} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Deals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentDeals.length === 0 && (
              <p className="text-sm text-gray-400">No deals yet</p>
            )}
            {data.recentDeals.map((deal) => (
              <Link key={deal.id} href={`/deals/${deal.id}`} className="block group">
                <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {deal.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {deal.contact ? `${deal.contact.firstName} ${deal.contact.lastName}` : "No contact"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-3 shrink-0">
                    <span className="text-sm font-medium text-gray-900">
                      {deal.value ? formatCurrency(deal.value) : "—"}
                    </span>
                    <Badge variant={stageColors[deal.stage] as "default"} className="text-xs">
                      {deal.stage}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
            <Link href="/deals" className="text-xs text-blue-600 hover:underline mt-2 block">
              View all deals →
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Contacts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {data.recentContacts.length === 0 && (
              <p className="text-sm text-gray-400">No contacts yet</p>
            )}
            {data.recentContacts.map((contact) => (
              <Link key={contact.id} href={`/contacts/${contact.id}`} className="block group">
                <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-medium text-blue-700">
                        {contact.firstName[0]}{contact.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {contact.firstName} {contact.lastName}
                      </p>
                      <p className="text-xs text-gray-400">{contact.company?.name ?? contact.email ?? "—"}</p>
                    </div>
                  </div>
                  <Badge variant={stageColors[contact.status] as "default"} className="text-xs">
                    {contact.status}
                  </Badge>
                </div>
              </Link>
            ))}
            <Link href="/contacts" className="text-xs text-blue-600 hover:underline mt-2 block">
              View all contacts →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Activities this week</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{data.activitiesThisWeek}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Total deals</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{data.totalDeals}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-700">Deals won</span>
                </div>
                <span className="text-sm font-semibold text-green-700">{data.wonDeals._count}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-50">
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="h-4 w-4 text-red-400" />
                  <span className="text-sm text-red-600">Deals lost</span>
                </div>
                <span className="text-sm font-semibold text-red-600">
                  {data.dealsByStage.find((s) => s.stage === "LOST")?._count ?? 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
