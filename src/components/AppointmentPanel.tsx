import React, { useState, useEffect } from "react";
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
import {
  CalendarIcon,
  Clock,
  Edit,
  Plus,
  Search,
  Trash2,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getAppointments, addAppointment, updateAppointment } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface Appointment {
  id: string;
  title: string;
  date: Date;
  time: string;
  doctor: string;
  doctor_id?: string;
  department: string;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
  patient?: {
    id: string;
    display_name: string;
    email: string;
    role: string;
  };
}

interface AppointmentPanelProps {
  userRole?: "patient" | "healthcare" | "admin";
}

const AppointmentPanel = ({ userRole = "patient" }: AppointmentPanelProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // New state for appointment form
  const [appointmentType, setAppointmentType] = useState("checkup");
  const [appointmentDepartment, setAppointmentDepartment] = useState("general");
  const [appointmentDoctor, setAppointmentDoctor] = useState("johnson");
  const [appointmentTime, setAppointmentTime] = useState("10am");
  const [appointmentNotes, setAppointmentNotes] = useState("");
  const [editingAppointment, setEditingAppointment] = useState<string | null>(
    null,
  );

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await getAppointments();

      // Transform the data to match our component's expected format
      const formattedAppointments = data.map((appointment: any) => ({
        id: appointment.id,
        title: appointment.title,
        date: new Date(appointment.date),
        time: appointment.time,
        doctor: appointment.doctor?.display_name || "Unknown Doctor",
        doctor_id: appointment.doctor_id,
        department: appointment.department,
        status: appointment.status,
        notes: appointment.notes,
        patient: appointment.patient,
      }));

      setAppointments(formattedAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast({
        title: "Error",
        description: "Failed to load appointments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [toast]);

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

  // Handle booking a new appointment
  const handleBookAppointment = async () => {
    try {
      if (!currentUser || !date) {
        toast({
          title: "Error",
          description: "Please select a date and ensure you are logged in.",
          variant: "destructive",
        });
        return;
      }

      const doctorMap: Record<string, string> = {
        johnson: "dr_sarah_johnson",
        chen: "dr_michael_chen",
        rodriguez: "dr_emily_rodriguez",
        wilson: "dr_james_wilson",
      };

      const appointmentData = {
        title: getAppointmentTitle(appointmentType),
        date: date.toISOString().split("T")[0],
        time: getAppointmentTimeFormatted(appointmentTime),
        doctor_id: doctorMap[appointmentDoctor] || doctorMap.johnson,
        department: appointmentDepartment,
        status: "scheduled",
        notes: appointmentNotes,
        patient_id: currentUser.uid,
      };

      if (editingAppointment) {
        await updateAppointment(editingAppointment, appointmentData);
        toast({
          title: "Success",
          description: "Appointment updated successfully.",
        });
      } else {
        await addAppointment(appointmentData);
        toast({
          title: "Success",
          description: "Appointment booked successfully.",
        });
      }

      // Reset form and close dialog
      setAppointmentType("checkup");
      setAppointmentDepartment("general");
      setAppointmentDoctor("johnson");
      setAppointmentTime("10am");
      setAppointmentNotes("");
      setEditingAppointment(null);
      setBookingDialogOpen(false);

      // Refresh appointments
      fetchAppointments();
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast({
        title: "Error",
        description: "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle cancelling an appointment
  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await updateAppointment(appointmentId, { status: "cancelled" });
      toast({
        title: "Success",
        description: "Appointment cancelled successfully.",
      });
      fetchAppointments();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast({
        title: "Error",
        description: "Failed to cancel appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle editing an appointment
  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment.id);
    setDate(appointment.date);

    // Map appointment type back to form value
    const typeMap: Record<string, string> = {
      "General Checkup": "checkup",
      "Follow-up Visit": "followup",
      "Specialist Consultation": "specialist",
      Emergency: "emergency",
    };
    setAppointmentType(typeMap[appointment.title] || "checkup");

    // Map department back to form value
    setAppointmentDepartment(appointment.department);

    // Map doctor back to form value
    const doctorLastNameMap: Record<string, string> = {
      "Dr. Sarah Johnson": "johnson",
      "Dr. Michael Chen": "chen",
      "Dr. Emily Rodriguez": "rodriguez",
      "Dr. James Wilson": "wilson",
    };
    setAppointmentDoctor(doctorLastNameMap[appointment.doctor] || "johnson");

    // Map time back to form value
    const timeMap: Record<string, string> = {
      "9:00 AM": "9am",
      "10:00 AM": "10am",
      "11:00 AM": "11am",
      "1:00 PM": "1pm",
      "2:00 PM": "2pm",
      "3:00 PM": "3pm",
      "4:00 PM": "4pm",
    };
    setAppointmentTime(timeMap[appointment.time] || "10am");

    setAppointmentNotes(appointment.notes || "");
    setBookingDialogOpen(true);
  };

  // Helper function to get appointment title from type
  const getAppointmentTitle = (type: string): string => {
    const titles: Record<string, string> = {
      checkup: "General Checkup",
      followup: "Follow-up Visit",
      specialist: "Specialist Consultation",
      emergency: "Emergency",
    };
    return titles[type] || titles.checkup;
  };

  // Helper function to get formatted time from time value
  const getAppointmentTimeFormatted = (time: string): string => {
    const times: Record<string, string> = {
      "9am": "9:00 AM",
      "10am": "10:00 AM",
      "11am": "11:00 AM",
      "1pm": "1:00 PM",
      "2pm": "2:00 PM",
      "3pm": "3:00 PM",
      "4pm": "4:00 PM",
    };
    return times[time] || times["10am"];
  };

  // Filter appointments based on status
  const upcomingAppointments = appointments.filter(
    (app) => app.status === "scheduled",
  );
  const pastAppointments = appointments.filter(
    (app) => app.status === "completed",
  );
  const cancelledAppointments = appointments.filter(
    (app) => app.status === "cancelled",
  );

  // Filter appointments for healthcare worker view based on selected date
  const appointmentsForSelectedDate = appointments.filter((app) => {
    if (!date) return false;
    const appDate = new Date(app.date);
    return (
      appDate.getDate() === date.getDate() &&
      appDate.getMonth() === date.getMonth() &&
      appDate.getFullYear() === date.getFullYear()
    );
  });

  const renderPatientView = () => {
    return (
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
                <DialogTitle>
                  {editingAppointment
                    ? "Edit Appointment"
                    : "Book New Appointment"}
                </DialogTitle>
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
                  <Select
                    value={appointmentType}
                    onValueChange={setAppointmentType}
                  >
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
                  <Select
                    value={appointmentDepartment}
                    onValueChange={setAppointmentDepartment}
                  >
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
                  <Select
                    value={appointmentDoctor}
                    onValueChange={setAppointmentDoctor}
                  >
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
                  <Select
                    value={appointmentTime}
                    onValueChange={setAppointmentTime}
                  >
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
                    value={appointmentNotes}
                    onChange={(e) => setAppointmentNotes(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingAppointment(null);
                    setBookingDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleBookAppointment}>
                  {editingAppointment
                    ? "Update Appointment"
                    : "Book Appointment"}
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
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            Loading appointments...
                          </TableCell>
                        </TableRow>
                      ) : upcomingAppointments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            No upcoming appointments found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        upcomingAppointments.map((appointment) => (
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
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleEditAppointment(appointment)
                                  }
                                >
                                  <Edit size={14} className="mr-1" />
                                  Reschedule
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() =>
                                    handleCancelAppointment(appointment.id)
                                  }
                                >
                                  <Trash2 size={14} className="mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
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
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            Loading appointments...
                          </TableCell>
                        </TableRow>
                      ) : pastAppointments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            No past appointments found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        pastAppointments.map((appointment) => (
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
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Clone the appointment for a new booking
                                  setDate(new Date());
                                  setAppointmentType(
                                    appointment.title === "General Checkup"
                                      ? "checkup"
                                      : appointment.title === "Follow-up Visit"
                                        ? "followup"
                                        : appointment.title ===
                                            "Specialist Consultation"
                                          ? "specialist"
                                          : "emergency",
                                  );
                                  setAppointmentDepartment(
                                    appointment.department,
                                  );
                                  setAppointmentDoctor(
                                    appointment.doctor.includes("Johnson")
                                      ? "johnson"
                                      : appointment.doctor.includes("Chen")
                                        ? "chen"
                                        : appointment.doctor.includes(
                                              "Rodriguez",
                                            )
                                          ? "rodriguez"
                                          : "wilson",
                                  );
                                  setAppointmentTime("10am");
                                  setAppointmentNotes(appointment.notes || "");
                                  setBookingDialogOpen(true);
                                }}
                              >
                                Book Similar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
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
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            Loading appointments...
                          </TableCell>
                        </TableRow>
                      ) : cancelledAppointments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            No cancelled appointments found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        cancelledAppointments.map((appointment) => (
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
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Clone the appointment but set status to scheduled
                                  handleEditAppointment({
                                    ...appointment,
                                    status: "scheduled",
                                  });
                                }}
                              >
                                Rebook
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  const renderHealthcareWorkerView = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Manage Appointments</h2>
          <div className="flex gap-2">
            <Button variant="outline">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Export Schedule
            </Button>
            <Button
              onClick={() => {
                setEditingAppointment(null);
                setDate(new Date());
                setAppointmentType("checkup");
                setAppointmentDepartment("general");
                setAppointmentDoctor("johnson");
                setAppointmentTime("10am");
                setAppointmentNotes("");
                setBookingDialogOpen(true);
              }}
            >
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
              <CardTitle>
                Appointments for {date?.toLocaleDateString()}
              </CardTitle>
              <CardDescription>
                Manage your patient appointments
              </CardDescription>
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
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          Loading appointments...
                        </TableCell>
                      </TableRow>
                    ) : appointmentsForSelectedDate.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No appointments scheduled for this date.
                        </TableCell>
                      </TableRow>
                    ) : (
                      appointmentsForSelectedDate.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>{appointment.time}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User size={16} />
                              {appointment.patient?.display_name ||
                                "Unknown Patient"}
                            </div>
                          </TableCell>
                          <TableCell>{appointment.title}</TableCell>
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
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleEditAppointment(appointment)
                                }
                              >
                                <Edit size={14} className="mr-1" />
                                Update
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() =>
                                  handleCancelAppointment(appointment.id)
                                }
                              >
                                <Trash2 size={14} className="mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">
                <Clock className="mr-2 h-4 w-4" />
                Set Availability
              </Button>
              <Button
                onClick={() => {
                  setEditingAppointment(null);
                  setDate(new Date());
                  setAppointmentType("checkup");
                  setAppointmentDepartment("general");
                  setAppointmentDoctor("johnson");
                  setAppointmentTime("10am");
                  setAppointmentNotes("");
                  setBookingDialogOpen(true);
                }}
              >
                <Plus size={16} className="mr-2" />
                Add Appointment
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAppointment
                  ? "Edit Appointment"
                  : "Add New Appointment"}
              </DialogTitle>
              <DialogDescription>
                {editingAppointment
                  ? "Update the appointment details."
                  : "Schedule a new appointment for a patient."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="appointment-type" className="col-span-1">
                  Type
                </Label>
                <Select
                  value={appointmentType}
                  onValueChange={setAppointmentType}
                >
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
                <Select
                  value={appointmentDepartment}
                  onValueChange={setAppointmentDepartment}
                >
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
                <Select
                  value={appointmentTime}
                  onValueChange={setAppointmentTime}
                >
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
                  value={appointmentNotes}
                  onChange={(e) => setAppointmentNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingAppointment(null);
                  setBookingDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleBookAppointment}>
                {editingAppointment ? "Update Appointment" : "Add Appointment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  const renderAdminView = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">System Appointments</h2>
          <div className="flex gap-2">
            <Button variant="outline">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <Button
              onClick={() => {
                setEditingAppointment(null);
                setDate(new Date());
                setAppointmentType("checkup");
                setAppointmentDepartment("general");
                setAppointmentDoctor("johnson");
                setAppointmentTime("10am");
                setAppointmentNotes("");
                setBookingDialogOpen(true);
              }}
            >
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
                  <div className="text-3xl font-bold">
                    {appointments.length}
                  </div>
                  <p className="text-sm text-muted-foreground">This month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {appointments.length > 0
                      ? Math.round(
                          (pastAppointments.length / appointments.length) * 100,
                        ) + "%"
                      : "0%"}
                  </div>
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
                  <div className="text-3xl font-bold">
                    {cancelledAppointments.length}
                  </div>
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
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            Loading appointments...
                          </TableCell>
                        </TableRow>
                      ) : appointments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            No appointments found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        appointments.map((appointment) => (
                          <TableRow key={appointment.id}>
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
                            <TableCell>
                              {appointment.patient?.display_name ||
                                "Unknown Patient"}
                            </TableCell>
                            <TableCell>{appointment.doctor}</TableCell>
                            <TableCell>{appointment.department}</TableCell>
                            <TableCell>{appointment.title}</TableCell>
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
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleEditAppointment(appointment)
                                  }
                                >
                                  <Edit size={14} className="mr-1" />
                                  Edit
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
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
                      <div className="text-2xl font-bold">
                        {
                          appointments.filter((a) => a.department === "general")
                            .length
                        }
                      </div>
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
                      <div className="text-2xl font-bold">
                        {
                          appointments.filter(
                            (a) => a.department === "cardiology",
                          ).length
                        }
                      </div>
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
                      <div className="text-2xl font-bold">
                        {
                          appointments.filter(
                            (a) => a.department === "pediatrics",
                          ).length
                        }
                      </div>
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
                      <div className="text-2xl font-bold">
                        {
                          appointments.filter((a) =>
                            a.doctor.includes("Johnson"),
                          ).length
                        }
                      </div>
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
                      <div className="text-2xl font-bold">
                        {
                          appointments.filter((a) => a.doctor.includes("Chen"))
                            .length
                        }
                      </div>
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
                      <div className="text-2xl font-bold">
                        {
                          appointments.filter((a) =>
                            a.doctor.includes("Rodriguez"),
                          ).length
                        }
                      </div>
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
                  Find and view patient appointment records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex mb-6">
                  <Input placeholder="Find patients..." className="max-w-sm" />
                  <Button className="ml-2">
                    <Search size={16} className="mr-2" />
                    Find
                  </Button>
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

        <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAppointment
                  ? "Edit Appointment"
                  : "Create New Appointment"}
              </DialogTitle>
              <DialogDescription>
                {editingAppointment
                  ? "Update the appointment details."
                  : "Schedule a new appointment for a patient."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="appointment-type" className="col-span-1">
                  Type
                </Label>
                <Select
                  value={appointmentType}
                  onValueChange={setAppointmentType}
                >
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
                <Select
                  value={appointmentDepartment}
                  onValueChange={setAppointmentDepartment}
                >
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
                <Select
                  value={appointmentTime}
                  onValueChange={setAppointmentTime}
                >
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
                  value={appointmentNotes}
                  onChange={(e) => setAppointmentNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingAppointment(null);
                  setBookingDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleBookAppointment}>
                {editingAppointment
                  ? "Update Appointment"
                  : "Create Appointment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      {userRole === "patient" && renderPatientView()}
      {userRole === "healthcare" && renderHealthcareWorkerView()}
      {userRole === "admin" && renderAdminView()}
    </div>
  );
};

export default AppointmentPanel;
