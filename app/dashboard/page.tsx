"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  MessageSquare,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Settings,
  Bell,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
    skillsOffered: ["Web Development", "React", "Node.js"],
    skillsWanted: ["UI/UX Design", "Photography"],
    rating: 4.8,
    completedSwaps: 12,
    isPublic: true,
  })

  const [swapRequests, setSwapRequests] = useState([
    {
      id: 1,
      type: "incoming",
      user: "Sarah Wilson",
      avatar: "/placeholder.svg?height=32&width=32",
      skillOffered: "Graphic Design",
      skillWanted: "Web Development",
      status: "pending",
      date: "2024-01-15",
    },
    {
      id: 2,
      type: "outgoing",
      user: "Mike Chen",
      avatar: "/placeholder.svg?height=32&width=32",
      skillOffered: "Photography",
      skillWanted: "React",
      status: "accepted",
      date: "2024-01-14",
    },
    {
      id: 3,
      type: "incoming",
      user: "Emma Davis",
      avatar: "/placeholder.svg?height=32&width=32",
      skillOffered: "UI/UX Design",
      skillWanted: "Node.js",
      status: "pending",
      date: "2024-01-13",
    },
  ])

  const router = useRouter()

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (!isLoggedIn) {
      router.push("/auth/login")
    }
  }, [router])

  const handleSwapAction = (id: number, action: "accept" | "reject") => {
    setSwapRequests((prev) =>
      prev.map((request) =>
        request.id === id ? { ...request, status: action === "accept" ? "accepted" : "rejected" } : request,
      ),
    )
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
              SkillSwap
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
            <Link href="/browse">
              <Button variant="ghost" size="sm">
                <Search className="w-4 h-4 mr-2" />
                Browse
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </Link>
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.avatar || "/placeholder.svg"} />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name}!</h1>
          <p className="text-gray-600">Here's what's happening with your skill swaps today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Swaps</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.completedSwaps}</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.rating}</div>
              <p className="text-xs text-muted-foreground">Based on {user.completedSwaps} reviews</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{swapRequests.filter((r) => r.status === "pending").length}</div>
              <p className="text-xs text-muted-foreground">Awaiting your response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skills Offered</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.skillsOffered.length}</div>
              <p className="text-xs text-muted-foreground">
                <Link href="/profile" className="text-blue-600 hover:underline">
                  Add more skills
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Swap Requests */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Swap Requests</CardTitle>
                <CardDescription>Manage your incoming and outgoing swap requests</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="incoming" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="incoming">
                      Incoming ({swapRequests.filter((r) => r.type === "incoming").length})
                    </TabsTrigger>
                    <TabsTrigger value="outgoing">
                      Outgoing ({swapRequests.filter((r) => r.type === "outgoing").length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="incoming" className="space-y-4">
                    {swapRequests
                      .filter((request) => request.type === "incoming")
                      .map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarImage src={request.avatar || "/placeholder.svg"} />
                              <AvatarFallback>{request.user[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{request.user}</p>
                              <p className="text-sm text-gray-600">
                                Offers: <Badge variant="secondary">{request.skillOffered}</Badge>
                              </p>
                              <p className="text-sm text-gray-600">
                                Wants: <Badge variant="outline">{request.skillWanted}</Badge>
                              </p>
                            </div>
                          </div>

                          {request.status === "pending" ? (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleSwapAction(request.id, "accept")}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSwapAction(request.id, "reject")}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Decline
                              </Button>
                            </div>
                          ) : (
                            <Badge variant={request.status === "accepted" ? "default" : "destructive"}>
                              {request.status}
                            </Badge>
                          )}
                        </div>
                      ))}
                  </TabsContent>

                  <TabsContent value="outgoing" className="space-y-4">
                    {swapRequests
                      .filter((request) => request.type === "outgoing")
                      .map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarImage src={request.avatar || "/placeholder.svg"} />
                              <AvatarFallback>{request.user[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{request.user}</p>
                              <p className="text-sm text-gray-600">
                                You offered: <Badge variant="secondary">{request.skillWanted}</Badge>
                              </p>
                              <p className="text-sm text-gray-600">
                                You want: <Badge variant="outline">{request.skillOffered}</Badge>
                              </p>
                            </div>
                          </div>

                          <Badge
                            variant={
                              request.status === "accepted"
                                ? "default"
                                : request.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {request.status}
                          </Badge>
                        </div>
                      ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Profile Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>Profile visibility: {user.isPublic ? "Public" : "Private"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Skills You Offer</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.skillsOffered.map((skill) => (
                      <Badge key={skill} variant="default">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Skills You Want</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.skillsWanted.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Link href="/profile">
                  <Button className="w-full bg-transparent" variant="outline">
                    Edit Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/browse">
                  <Button className="w-full bg-transparent" variant="outline">
                    <Search className="w-4 h-4 mr-2" />
                    Browse Skills
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button className="w-full bg-transparent" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Skills
                  </Button>
                </Link>
                <Button className="w-full bg-transparent" variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Messages
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
