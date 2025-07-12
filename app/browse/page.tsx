"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Search, Filter, MapPin, Star, MessageSquare, ArrowLeft, Clock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

const mockUsers = [
  {
    id: 1,
    name: "Sarah Wilson",
    location: "San Francisco, CA",
    avatar: "/placeholder.svg?height=64&width=64",
    rating: 4.9,
    completedSwaps: 15,
    skillsOffered: ["Graphic Design", "Adobe Photoshop", "Branding"],
    skillsWanted: ["Web Development", "React"],
    availability: ["Weekends", "Evenings"],
    isOnline: true,
  },
  {
    id: 2,
    name: "Mike Chen",
    location: "New York, NY",
    avatar: "/placeholder.svg?height=64&width=64",
    rating: 4.7,
    completedSwaps: 23,
    skillsOffered: ["Photography", "Photo Editing", "Lightroom"],
    skillsWanted: ["Video Editing", "Motion Graphics"],
    availability: ["Weekdays", "Mornings"],
    isOnline: false,
  },
  {
    id: 3,
    name: "Emma Davis",
    location: "Austin, TX",
    avatar: "/placeholder.svg?height=64&width=64",
    rating: 4.8,
    completedSwaps: 18,
    skillsOffered: ["UI/UX Design", "Figma", "User Research"],
    skillsWanted: ["Frontend Development", "CSS"],
    availability: ["Flexible"],
    isOnline: true,
  },
  {
    id: 4,
    name: "Alex Rodriguez",
    location: "Los Angeles, CA",
    avatar: "/placeholder.svg?height=64&width=64",
    rating: 4.6,
    completedSwaps: 12,
    skillsOffered: ["Digital Marketing", "SEO", "Content Strategy"],
    skillsWanted: ["Data Analysis", "Python"],
    availability: ["Evenings", "Weekends"],
    isOnline: true,
  },
  {
    id: 5,
    name: "Lisa Park",
    location: "Seattle, WA",
    avatar: "/placeholder.svg?height=64&width=64",
    rating: 4.9,
    completedSwaps: 27,
    skillsOffered: ["Data Science", "Python", "Machine Learning"],
    skillsWanted: ["Public Speaking", "Presentation Skills"],
    availability: ["Weekdays"],
    isOnline: false,
  },
  {
    id: 6,
    name: "David Kim",
    location: "Chicago, IL",
    avatar: "/placeholder.svg?height=64&width=64",
    rating: 4.5,
    completedSwaps: 9,
    skillsOffered: ["Music Production", "Audio Engineering", "Logic Pro"],
    skillsWanted: ["Video Production", "After Effects"],
    availability: ["Evenings"],
    isOnline: true,
  },
]

export default function BrowsePage() {
  const [users, setUsers] = useState(mockUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedAvailability, setSelectedAvailability] = useState("all")
  const [sortBy, setSortBy] = useState("rating")

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (!isLoggedIn) {
      router.push("/auth/login")
    }
  }, [router])

  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        searchTerm === "" ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.skillsOffered.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
        user.skillsWanted.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesLocation =
        selectedLocation === "all" || user.location.toLowerCase().includes(selectedLocation.toLowerCase())

      const matchesAvailability = selectedAvailability === "all" || user.availability.includes(selectedAvailability)

      return matchesSearch && matchesLocation && matchesAvailability
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating
        case "swaps":
          return b.completedSwaps - a.completedSwaps
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

  const handleSendRequest = (userId: number, userName: string) => {
    toast({
      title: "Request sent!",
      description: `Your swap request has been sent to ${userName}.`,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SkillSwap
              </span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Skills</h1>
          <p className="text-gray-600">Discover talented individuals and find the skills you're looking for.</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search skills or names..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="san francisco">San Francisco</SelectItem>
                  <SelectItem value="new york">New York</SelectItem>
                  <SelectItem value="austin">Austin</SelectItem>
                  <SelectItem value="los angeles">Los Angeles</SelectItem>
                  <SelectItem value="seattle">Seattle</SelectItem>
                  <SelectItem value="chicago">Chicago</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
                <SelectTrigger>
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Time</SelectItem>
                  <SelectItem value="Weekdays">Weekdays</SelectItem>
                  <SelectItem value="Weekends">Weekends</SelectItem>
                  <SelectItem value="Mornings">Mornings</SelectItem>
                  <SelectItem value="Afternoons">Afternoons</SelectItem>
                  <SelectItem value="Evenings">Evenings</SelectItem>
                  <SelectItem value="Flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="swaps">Most Swaps</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-600">
            Showing {filteredUsers.length} of {users.length} users
          </p>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Online</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {user.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{user.name}</CardTitle>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-3 h-3 mr-1" />
                        {user.location}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm">
                      <Star className="w-4 h-4 text-yellow-500 mr-1 fill-current" />
                      {user.rating}
                    </div>
                    <div className="text-xs text-gray-500">{user.completedSwaps} swaps</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">Offers:</h4>
                  <div className="flex flex-wrap gap-1">
                    {user.skillsOffered.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="default" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {user.skillsOffered.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{user.skillsOffered.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Wants:</h4>
                  <div className="flex flex-wrap gap-1">
                    {user.skillsWanted.slice(0, 2).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {user.skillsWanted.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{user.skillsWanted.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  Available: {user.availability.join(", ")}
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button className="flex-1" size="sm" onClick={() => handleSendRequest(user.id, user.name)}>
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Request Swap
                  </Button>
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-500 mb-4">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No users found</h3>
                <p>Try adjusting your search criteria or filters.</p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedLocation("all")
                  setSelectedAvailability("all")
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
