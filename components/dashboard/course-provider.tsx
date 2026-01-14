"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, PlayCircle, FileText, ExternalLink, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface CourseProviderProps {
  courseProgress: any[]
  userId: string
}

export function CourseProvider({ courseProgress: initialProgress, userId }: CourseProviderProps) {
  const [courses, setCourses] = useState<any[]>([])
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [courseContent, setCourseContent] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("courses").select("*").order("created_at", { ascending: false })

    if (data) {
      setCourses(data)
      if (data.length > 0) {
        loadCourseContent(data[0].id)
        setSelectedCourse(data[0])
      }
    }
    setIsLoading(false)
  }

  const loadCourseContent = async (courseId: string) => {
    const supabase = createClient()
    const { data } = await supabase.from("course_content").select("*").eq("course_id", courseId)

    if (data) {
      setCourseContent(data)
    }
  }

  const selectCourse = (course: any) => {
    setSelectedCourse(course)
    loadCourseContent(course.id)
  }

  const getIconForContentType = (type: string) => {
    switch (type) {
      case "video":
        return <PlayCircle className="h-5 w-5" />
      case "article":
        return <FileText className="h-5 w-5" />
      case "practice":
        return <CheckCircle className="h-5 w-5" />
      default:
        return <BookOpen className="h-5 w-5" />
    }
  }

  const filterCoursesByCategory = (category: string) => {
    return courses.filter((course) => course.category === category)
  }

  return (
    <div className="space-y-6">
      {/* Course Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Course Library</CardTitle>
          <CardDescription>Browse SAT prep courses organized by subject area</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Courses</TabsTrigger>
              <TabsTrigger value="math">Math</TabsTrigger>
              <TabsTrigger value="reading">Reading</TabsTrigger>
              <TabsTrigger value="writing">Writing</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => selectCourse(course)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedCourse?.id === course.id ? "border-[#4ECDC4] bg-[#4ECDC4]/10" : "hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold line-clamp-2">{course.title}</h3>
                      <Badge
                        variant={course.difficulty === "beginner" ? "secondary" : "default"}
                        className={
                          course.difficulty === "advanced"
                            ? "bg-[#1B4B6B] text-white"
                            : course.difficulty === "intermediate"
                              ? "bg-[#4ECDC4] text-[#0A2540]"
                              : ""
                        }
                      >
                        {course.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                    <div className="mt-3">
                      <Badge variant="outline" className="text-xs">
                        {course.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="math" className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterCoursesByCategory("math").map((course) => (
                  <div
                    key={course.id}
                    onClick={() => selectCourse(course)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedCourse?.id === course.id ? "border-[#4ECDC4] bg-[#4ECDC4]/10" : "hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold line-clamp-2">{course.title}</h3>
                      <Badge variant="secondary">{course.difficulty}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reading" className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterCoursesByCategory("reading").map((course) => (
                  <div
                    key={course.id}
                    onClick={() => selectCourse(course)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedCourse?.id === course.id ? "border-[#4ECDC4] bg-[#4ECDC4]/10" : "hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold line-clamp-2">{course.title}</h3>
                      <Badge variant="secondary">{course.difficulty}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="writing" className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterCoursesByCategory("writing").map((course) => (
                  <div
                    key={course.id}
                    onClick={() => selectCourse(course)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedCourse?.id === course.id ? "border-[#4ECDC4] bg-[#4ECDC4]/10" : "hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold line-clamp-2">{course.title}</h3>
                      <Badge variant="secondary">{course.difficulty}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Course Content */}
      {selectedCourse && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedCourse.title}</CardTitle>
            <CardDescription>{selectedCourse.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {courseContent.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No content available for this course yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {courseContent.map((content) => (
                  <div
                    key={content.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#4ECDC4]/20 flex items-center justify-center text-[#1B4B6B]">
                      {getIconForContentType(content.content_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{content.title}</h4>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {content.content_type}
                          </Badge>
                        </div>
                        {content.url && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={content.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{content.summary}</p>
                      {content.key_points && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs font-semibold text-gray-700 mb-2">Key Points:</p>
                          <ul className="space-y-1">
                            {JSON.parse(content.key_points).map((point: string, idx: number) => (
                              <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                                <span className="text-[#4ECDC4]">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Integration Info */}
      <Card className="bg-gradient-to-br from-[#4ECDC4]/10 to-[#1B4B6B]/10 border-[#4ECDC4]">
        <CardHeader>
          <CardTitle>Content Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Web Scraping:</strong> Course content is aggregated from trusted SAT prep resources and
            automatically updated.
          </p>
          <p>
            <strong>YouTube Integration:</strong> Video lessons are embedded with timestamps and key takeaways.
          </p>
          <p>
            <strong>AI Summarization:</strong> All content includes AI-generated summaries highlighting the most
            important concepts.
          </p>
          <p>
            <strong>Future Integration:</strong> Gemini AI will power advanced content recommendations and personalized
            learning paths.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
