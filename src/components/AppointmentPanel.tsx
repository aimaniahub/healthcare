import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon, Clock, Edit, Plus, Trash2, User } from "lucide-react";

interface Appointment {
  id: string;
  title: string;
  date: Date;
  time: string;
  doctor: string;
  department: string;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
}

interface AppointmentPanelProps {
  userRole?: "patient" | "healthcare" | "admin";
}

const AppointmentPanel = ({ userRole = "patient" }: AppointmentPanelProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  // Mock appointments data
  const mockAppointments: Appointment[] = [
    {
      id: "1",
      title: "Annual Checkup",
      date: new Date(2023, 5, 15),
      time: "10:00 AM",
      doctor: "Dr. Sarah Johnson",
      department: "General Medicine",
      status: "scheduled",
      notes: "Regular annual physical examination",
    },
    {
      id: "2",
      title: "Dental Cleaning",
      date: new Date(2023, 5, 22),
      time: "2:30 PM",
      doctor: "Dr. Michael Chen",
      department: "Dentistry",
      status: "scheduled",
      notes: "Routine dental cleaning and checkup",
    },
    {
      id: "3",
      title: "Eye Examination",
      date: new Date(2023, 4, 10),
      time: "11:15 AM",
      doctor: "Dr. Emily Rodriguez",
      department: "Ophthalmology",
      status: "completed",
      notes: "Vision test and eye health assessment",
    },
    {
      id: "4",
      title: "Cardiology Consultation",
      date: new Date(2023, 3, 5),
      time: "9:00 AM",
      doctor: "Dr. James Wilson",
      department: "Cardiology",
      status: "cancelled",
      notes: "Follow-up on heart condition",
    },
  ];

  const getStatusBadgeColor = (status: Appointment["status"]) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "";
    }
  };

  const renderPatientView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Appointments</h2>
        <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Book Appointment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Book New Appointment</DialogTitle>
              <DialogDescription>
                Fill in the details to schedule your appointment with a
                healthcare provider.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="appointment-type" className="col-span-1">
                  Type
                </Label>
                <Select defaultValue="checkup">
                  <SelectTrigger id="appointment-type" className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checkup">General Checkup</SelectItem>
                    <SelectItem value="followup">Follow-up Visit</SelectItem>
                    <SelectItem value="specialist">
                      Specialist Consultation
                    </SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="col-span-1">
                  Department
                </Label>
                <Select defaultValue="general">
                  <SelectTrigger id="department" className="col-span-3">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Medicine</SelectItem>
                    <SelectItem value="cardiology">Cardiology</SelectItem>
                    <SelectItem value="dermatology">Dermatology</SelectItem>
                    <SelectItem value="neurology">Neurology</SelectItem>
                    <SelectItem value="orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="pediatrics">Pediatrics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="doctor" className="col-span-1">
                  Doctor
                </Label>
                <Select defaultValue="johnson">
                  <SelectTrigger id="doctor" className="col-span-3">
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="johnson">Dr. Sarah Johnson</SelectItem>
                    <SelectItem value="chen">Dr. Michael Chen</SelectItem>
                    <SelectItem value="rodriguez">
                      Dr. Emily Rodriguez
                    </SelectItem>
                    <SelectItem value="wilson">Dr. James Wilson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="col-span-1">
                  Date
                </Label>
                <div className="col-span-3">
                  <div className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 items-center">
                    {date ? date.toLocaleDateString() : "Select a date"}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="time" className="col-span-1">
                  Time
                </Label>
                <Select defaultValue="10am">
                  <SelectTrigger id="time" className="col-span-3">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9am">9:00 AM</SelectItem>
                    <SelectItem value="10am">10:00 AM</SelectItem>
                    <SelectItem value="11am">11:00 AM</SelectItem>
                    <SelectItem value="1pm">1:00 PM</SelectItem>
                    <SelectItem value="2pm">2:00 PM</SelectItem>
                    <SelectItem value="3pm">3:00 PM</SelectItem>
                    <SelectItem value="4pm">4:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="col-span-1">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Add any relevant information"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setBookingDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setBookingDialogOpen(false)}>
                Book Appointment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Appointment</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAppointments
                      .filter((app) => app.status === "scheduled")
                      .map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell className="font-medium">
                            {appointment.title}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>
                                {appointment.date.toLocaleDateString()}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {appointment.time}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{appointment.doctor}</TableCell>
                          <TableCell>{appointment.department}</TableCell>
                          <TableCell>
                            <Badge
                              className={getStatusBadgeColor(
                                appointment.status,
                              )}
                            >
                              {appointment.status.charAt(0).toUpperCase() +
                                appointment.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Edit size={14} className="mr-1" />
                                Reschedule
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={14} className="mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="past" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Appointment</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAppointments
                      .filter((app) => app.status === "completed")
                      .map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell className="font-medium">
                            {appointment.title}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>
                                {appointment.date.toLocaleDateString()}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {appointment.time}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{appointment.doctor}</TableCell>
                          <TableCell>{appointment.department}</TableCell>
                          <TableCell>
                            <Badge
                              className={getStatusBadgeColor(
                                appointment.status,
                              )}
                            >
                              {appointment.status.charAt(0).toUpperCase() +
                                appointment.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              Book Similar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="cancelled" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Appointment</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAppointments
                      .filter((app) => app.status === "cancelled")
                      .map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell className="font-medium">
                            {appointment.title}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>
                                {appointment.date.toLocaleDateString()}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {appointment.time}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{appointment.doctor}</TableCell>
                          <TableCell>{appointment.department}</TableCell>
                          <TableCell>
                            <Badge
                              className={getStatusBadgeColor(
                                appointment.status,
                              )}
                            >
                              {appointment.status.charAt(0).toUpperCase() +
                                appointment.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              Rebook
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderHealthcareWorkerView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Appointments</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Export Schedule
          </Button>
          <Button>
            <Plus size={16} className="mr-2" />
            Add Appointment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>View and manage your schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Appointments for {date?.toLocaleDateString()}</CardTitle>
            <CardDescription>Manage your patient appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>9:00 AM</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        John Smith
                      </div>
                    </TableCell>
                    <TableCell>Annual Checkup</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Scheduled
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit size={14} className="mr-1" />
                          Update
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={14} className="mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>10:30 AM</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        Maria Garcia
                      </div>
                    </TableCell>
                    <TableCell>Follow-up Visit</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Scheduled
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit size={14} className="mr-1" />
                          Update
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={14} className="mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>1:00 PM</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        Robert Johnson
                      </div>
                    </TableCell>
                    <TableCell>Specialist Consultation</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Scheduled
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit size={14} className="mr-1" />
                          Update
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={14} className="mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>3:30 PM</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        Emily Chen
                      </div>
                    </TableCell>
                    <TableCell>General Checkup</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Scheduled
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit size={14} className="mr-1" />
                          Update
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={14} className="mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              Set Availability
            </Button>
            <Button>
              <Plus size={16} className="mr-2" />
              Add Appointment
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );

  const renderAdminView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">System Appointments</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button>
            <Plus size={16} className="mr-2" />
            Create Appointment
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="departments">By Department</TabsTrigger>
          <TabsTrigger value="doctors">By Doctor</TabsTrigger>
          <TabsTrigger value="patients">By Patient</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Total Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">248</div>
                <p className="text-sm text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">92%</div>
                <p className="text-sm text-muted-foreground">
                  +5% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Cancellations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">18</div>
                <p className="text-sm text-muted-foreground">
                  -3% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Appointments</CardTitle>
              <CardDescription>
                System-wide appointment activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{appointment.date.toLocaleDateString()}</span>
                            <span className="text-sm text-muted-foreground">
                              {appointment.time}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>John Smith</TableCell>
                        <TableCell>{appointment.doctor}</TableCell>
                        <TableCell>{appointment.department}</TableCell>
                        <TableCell>{appointment.title}</TableCell>
                        <TableCell>
                          <Badge
                            className={getStatusBadgeColor(appointment.status)}
                          >
                            {appointment.status.charAt(0).toUpperCase() +
                              appointment.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit size={14} className="mr-1" />
                              Edit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Appointments by Department</CardTitle>
              <CardDescription>
                View and manage appointments by department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      General Medicine
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">87</div>
                    <p className="text-sm text-muted-foreground">
                      Appointments this month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Cardiology</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">42</div>
                    <p className="text-sm text-muted-foreground">
                      Appointments this month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Pediatrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">56</div>
                    <p className="text-sm text-muted-foreground">
                      Appointments this month
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="doctors" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Appointments by Doctor</CardTitle>
              <CardDescription>
                View and manage appointments by healthcare provider
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Dr. Sarah Johnson
                    </CardTitle>
                    <CardDescription>General Medicine</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">32</div>
                    <p className="text-sm text-muted-foreground">
                      Appointments this month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Dr. Michael Chen
                    </CardTitle>
                    <CardDescription>Dentistry</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">28</div>
                    <p className="text-sm text-muted-foreground">
                      Appointments this month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Dr. Emily Rodriguez
                    </CardTitle>
                    <CardDescription>Ophthalmology</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24</div>
                    <p className="text-sm text-muted-foreground">
                      Appointments this month
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Appointment History</CardTitle>
              <CardDescription>
                Search and view patient appointment records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex mb-6">
                <Input placeholder="Search patients..." className="max-w-sm" />
                <Button className="ml-2">Search</Button>
              </div>

              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Total Appointments</TableHead>
                      <TableHead>Last Visit</TableHead>
                      <TableHead>Next Appointment</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>John Smith</TableCell>
                      <TableCell>12</TableCell>
                      <TableCell>May 10, 2023</TableCell>
                      <TableCell>June 15, 2023</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View History
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Maria Garcia</TableCell>
                      <TableCell>8</TableCell>
                      <TableCell>April 22, 2023</TableCell>
                      <TableCell>June 5, 2023</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View History
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Robert Johnson</TableCell>
                      <TableCell>5</TableCell>
                      <TableCell>May 18, 2023</TableCell>
                      <TableCell>July 2, 2023</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View History
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      {userRole === "patient" && renderPatientView()}
      {userRole === "healthcare" && renderHealthcareWorkerView()}
      {userRole === "admin" && renderAdminView()}
    </div>
  );
};

export default AppointmentPanel;
