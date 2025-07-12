"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  Shield,
  Download,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Activity,
  Send,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

const mockReports = [
  {
    id: 1,
    type: "inappropriate_skill",
    reportedBy: "Sarah Wilson",
    targetUser: "John Spam",
    description: "User listed inappropriate skill descriptions",
    status: "pending",
    date: "2024-01-15",
  },
  {
    id: 2,
    type: "spam",
    reportedBy: "Mike Chen",
    targetUser: "Fake User",
    description: "Sending spam messages to multiple users",
    status: "pending",
    date: "2024-01-14",
  },
]

const mockUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    status: "active",
    joinDate: "2024-01-01",
    swapsCompleted: 12,
    rating: 4.8,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    status: "banned",
    joinDate: "2023-12-15",
    swapsCompleted: 3,
    rating: 2.1,
  },
]

const mockSwaps = [
  {
    id: 1,
    user1: "John Doe",
    user2: "Sarah Wilson",
    skill1: "Web Development",
    skill2: "Graphic Design",
    status: "completed",
    date: "2024-01-10",
  },
  {
    id: 2,
    user1: "Mike Chen",
    user2: "Emma Davis",
    skill1: "Photography",
    skill2: "UI/UX Design",
    status: "pending",
    date: "2024-01-12",
  },
]

export default function AdminPage() {
  const [reports, setReports] = useState(mockReports)
  const [users, setUsers] = useState(mockUsers)
  const [swaps, setSwaps] = useState(mockSwaps)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("info")

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const userRole = localStorage.getItem("userRole")
    const isLoggedIn = localStorage.getItem("isLoggedIn")

    if (!isLoggedIn || userRole !== "admin") {
      router.push("/auth/login")
    }
  }, [router])

  const handleReportAction = (reportId: number, action: "approve" | "reject") => {
    setReports((prev) =>
      prev.map((report) =>
        report.id === reportId ? { ...report, status: action === "approve" ? "approved" : "rejected" } : report,
      ),
    )

    toast({
      title: `Report ${action}d`,
      description: `The report has been ${action}d successfully.`,
    })
  }

  const handleUserAction = (userId: number, action: "ban" | "unban") => {
    setUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, status: action === "ban" ? "banned" : "active" } : user)),
    )

    toast({
      title: `User ${action}ned`,
      description: `The user has been ${action}ned successfully.`,
    })
  }

  const sendPlatformMessage = () => {
    if (!message.trim()) return

    toast({
      title: "Message sent",
      description: "Platform-wide message has been sent to all users.",
    })
    setMessage("")
  }

  const downloadReport = (type: string) => {
    toast({
      title: "Download started",
      description: `${type} report is being generated and will download shortly.`,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SkillSwap Admin
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="flex items-center">
              <Shield className="w-4 h-4 mr-1" />
              Administrator
            </Badge>
            <Button
              variant="outline"
              onClick={() => {
                localStorage.removeItem("userRole")
                localStorage.removeItem("isLoggedIn")
                router.push("/")
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor and manage the SkillSwap platform.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Swaps</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">+5% from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {reports.filter((r) => r.status === "pending").length}
              </div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">94.2%</div>
              <p className="text-xs text-muted-foreground">Successful swaps</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="swaps">Swaps</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Content Reports</CardTitle>
                <CardDescription>Review and moderate reported content and users.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant={report.type === "spam" ? "destructive" : "secondary"}>
                            {report.type.replace("_", " ")}
                          </Badge>
                          <span className="font-medium">{report.targetUser}</span>
                          <span className="text-sm text-gray-500">reported by {report.reportedBy}</span>
                        </div>
                        <p className="text-sm text-gray-600">{report.description}</p>
                        <p className="text-xs text-gray-400">{report.date}</p>
                      </div>

                      {report.status === "pending" ? (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleReportAction(report.id, "approve")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleReportAction(report.id, "reject")}>
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <Badge variant={report.status === "approved" ? "default" : "destructive"}>
                          {report.status}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and permissions.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Joined: {user.joinDate}</span>
                            <span>Swaps: {user.swapsCompleted}</span>
                            <span>Rating: {user.rating}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge variant={user.status === "active" ? "default" : "destructive"}>{user.status}</Badge>
                        {user.status === "active" ? (
                          <Button size="sm" variant="destructive" onClick={() => handleUserAction(user.id, "ban")}>
                            <Ban className="w-4 h-4 mr-1" />
                            Ban
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => handleUserAction(user.id, "unban")}>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Unban
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="swaps">
            <Card>
              <CardHeader>
                <CardTitle>Swap Monitoring</CardTitle>
                <CardDescription>Monitor ongoing and completed skill swaps.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {swaps.map((swap) => (
                    <div key={swap.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{swap.user1}</span>
                          <span className="text-gray-500">↔</span>
                          <span className="font-medium">{swap.user2}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Badge variant="secondary">{swap.skill1}</Badge>
                          <span>for</span>
                          <Badge variant="outline">{swap.skill2}</Badge>
                        </div>
                        <p className="text-xs text-gray-400">{swap.date}</p>
                      </div>

                      <Badge variant={swap.status === "completed" ? "default" : "secondary"}>{swap.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Platform Messages</CardTitle>
                <CardDescription>Send announcements and updates to all users.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message Type</label>
                  <Select value={messageType} onValueChange={setMessageType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Information</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="feature">New Feature</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    placeholder="Enter your platform-wide message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button onClick={sendPlatformMessage} disabled={!message.trim()}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Download Reports</CardTitle>
                  <CardDescription>Generate and download platform analytics.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => downloadReport("User Activity")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    User Activity Report
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => downloadReport("Swap Statistics")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Swap Statistics
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => downloadReport("Feedback Logs")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Feedback Logs
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Health</CardTitle>
                  <CardDescription>Key metrics and system status.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">System Status</span>
                    <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Users (24h)</span>
                    <span className="font-medium">342</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">New Registrations</span>
                    <span className="font-medium">23</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Completed Swaps</span>
                    <span className="font-medium">15</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
