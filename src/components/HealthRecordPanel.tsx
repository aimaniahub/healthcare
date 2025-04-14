import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Upload,
  FileText,
  Calendar,
  Clock,
  Plus,
  Download,
  Eye,
  Edit,
  AlertCircle,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HealthRecord {
  id: string;
  title: string;
  date: string;
  doctor: string;
  hospital: string;
  type: string;
  status: "approved" | "pending" | "rejected";
  fileUrl?: string;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  avatar?: string;
}

const HealthRecordPanel = ({
  userRole = "patient",
}: {
  userRole?: "patient" | "healthcare" | "admin";
}) => {
  const [activeTab, setActiveTab] = useState("records");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Mock data
  const healthRecords: HealthRecord[] = [
    {
      id: "1",
      title: "Annual Physical Examination",
      date: "2023-05-15",
      doctor: "Dr. Sarah Johnson",
      hospital: "Central Hospital",
      type: "Examination",
      status: "approved",
    },
    {
      id: "2",
      title: "Blood Test Results",
      date: "2023-06-22",
      doctor: "Dr. Michael Chen",
      hospital: "City Medical Center",
      type: "Lab Results",
      status: "approved",
    },
    {
      id: "3",
      title: "X-Ray Report",
      date: "2023-07-10",
      doctor: "Dr. Emily Rodriguez",
      hospital: "Central Hospital",
      type: "Radiology",
      status: "pending",
    },
    {
      id: "4",
      title: "Vaccination Record",
      date: "2023-08-05",
      doctor: "Dr. James Wilson",
      hospital: "Community Health Clinic",
      type: "Immunization",
      status: "approved",
    },
    {
      id: "5",
      title: "Allergy Test Results",
      date: "2023-09-18",
      doctor: "Dr. Lisa Thompson",
      hospital: "Allergy & Asthma Center",
      type: "Lab Results",
      status: "rejected",
    },
  ];

  const patients: Patient[] = [
    { id: "1", name: "John Doe", age: 45, gender: "Male" },
    { id: "2", name: "Jane Smith", age: 32, gender: "Female" },
    { id: "3", name: "Robert Johnson", age: 58, gender: "Male" },
    { id: "4", name: "Emily Davis", age: 27, gender: "Female" },
    { id: "5", name: "Michael Wilson", age: 41, gender: "Male" },
  ];

  const filteredRecords = healthRecords.filter(
    (record) =>
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.type.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const renderPatientView = () => (
    <div className="space-y-6 bg-white">
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search records..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Request Record
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Health Record</DialogTitle>
              <DialogDescription>
                Fill out this form to request a new health record from your
                healthcare provider.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="record-type" className="text-right">
                  Record Type
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="examination">Examination</SelectItem>
                    <SelectItem value="lab-results">Lab Results</SelectItem>
                    <SelectItem value="radiology">Radiology</SelectItem>
                    <SelectItem value="immunization">Immunization</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="provider" className="text-right">
                  Provider
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="central-hospital">
                      Central Hospital
                    </SelectItem>
                    <SelectItem value="city-medical">
                      City Medical Center
                    </SelectItem>
                    <SelectItem value="community-health">
                      Community Health Clinic
                    </SelectItem>
                    <SelectItem value="allergy-center">
                      Allergy & Asthma Center
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input id="date" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Input
                  id="notes"
                  className="col-span-3"
                  placeholder="Additional information..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setUploadDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setUploadDialogOpen(false)}>
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Health Records</CardTitle>
          <CardDescription>
            View and manage your personal health records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.title}
                    </TableCell>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.doctor}</TableCell>
                    <TableCell>{record.hospital}</TableCell>
                    <TableCell>{record.type}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No records found. Try adjusting your search or request a new
                    record.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderHealthcareView = () => (
    <div className="grid grid-cols-12 gap-6 bg-white">
      <div className="col-span-4 border rounded-lg p-4">
        <div className="mb-4">
          <Label htmlFor="patient-search">Search Patients</Label>
          <div className="relative mt-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="patient-search"
              placeholder="Search by name or ID..."
              className="pl-8"
            />
          </div>
        </div>

        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-2">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className={`p-3 rounded-md cursor-pointer transition-colors ${selectedPatient?.id === patient.id ? "bg-primary/10" : "hover:bg-muted"}`}
                onClick={() => setSelectedPatient(patient)}
              >
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={patient.avatar} />
                    <AvatarFallback>
                      {patient.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{patient.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {patient.age} years, {patient.gender}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="col-span-8">
        {selectedPatient ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedPatient.name}'s Records
                </h2>
                <p className="text-muted-foreground">
                  {selectedPatient.age} years, {selectedPatient.gender}
                </p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Record
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>Add New Health Record</DialogTitle>
                    <DialogDescription>
                      Create a new health record for {selectedPatient.name}.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">
                        Title
                      </Label>
                      <Input
                        id="title"
                        className="col-span-3"
                        placeholder="Record title"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="record-type" className="text-right">
                        Record Type
                      </Label>
                      <Select>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="examination">
                            Examination
                          </SelectItem>
                          <SelectItem value="lab-results">
                            Lab Results
                          </SelectItem>
                          <SelectItem value="radiology">Radiology</SelectItem>
                          <SelectItem value="immunization">
                            Immunization
                          </SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="date" className="text-right">
                        Date
                      </Label>
                      <Input id="date" type="date" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="file" className="text-right">
                        Upload File
                      </Label>
                      <Input id="file" type="file" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="notes" className="text-right">
                        Notes
                      </Label>
                      <Input
                        id="notes"
                        className="col-span-3"
                        placeholder="Additional information..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save Record</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Hospital</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {healthRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.title}
                        </TableCell>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>{record.doctor}</TableCell>
                        <TableCell>{record.hospital}</TableCell>
                        <TableCell>{record.type}</TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center border rounded-lg p-8">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No Patient Selected</h3>
              <p className="mt-2 text-muted-foreground">
                Select a patient from the list to view their health records.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderAdminView = () => (
    <div className="space-y-6 bg-white">
      <Tabs defaultValue="records" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="records">All Records</TabsTrigger>
            <TabsTrigger value="requests">Access Requests</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={
                  activeTab === "requests"
                    ? "Search requests..."
                    : "Search records..."
                }
                className="pl-8 w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {activeTab === "records" && (
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Record
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="records" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>System Health Records</CardTitle>
              <CardDescription>
                Manage all health records in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Hospital</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback>JD</AvatarFallback>
                          </Avatar>
                          <span>John Doe</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {record.title}
                      </TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{record.doctor}</TableCell>
                      <TableCell>{record.hospital}</TableCell>
                      <TableCell>{record.type}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Record Access Requests</CardTitle>
              <CardDescription>
                Manage requests for health record access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requestor</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Record Type</TableHead>
                    <TableHead>Date Requested</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback>MC</AvatarFallback>
                        </Avatar>
                        <span>Dr. Michael Chen</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <span>John Doe</span>
                      </div>
                    </TableCell>
                    <TableCell>Lab Results</TableCell>
                    <TableCell>2023-10-15</TableCell>
                    <TableCell>Treatment planning</TableCell>
                    <TableCell>
                      <Badge className="bg-yellow-500">Pending</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border-green-200"
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback>ER</AvatarFallback>
                        </Avatar>
                        <span>Dr. Emily Rodriguez</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback>JS</AvatarFallback>
                        </Avatar>
                        <span>Jane Smith</span>
                      </div>
                    </TableCell>
                    <TableCell>Radiology</TableCell>
                    <TableCell>2023-10-12</TableCell>
                    <TableCell>Specialist consultation</TableCell>
                    <TableCell>
                      <Badge className="bg-yellow-500">Pending</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border-green-200"
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1,248</div>
                <p className="text-xs text-muted-foreground mt-1">
                  +12% from last month
                </p>
                <div className="mt-4 h-1 w-full bg-muted overflow-hidden rounded-full">
                  <div className="bg-primary h-1 w-3/4 rounded-full" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">23</div>
                <p className="text-xs text-muted-foreground mt-1">
                  -5% from last month
                </p>
                <div className="mt-4 h-1 w-full bg-muted overflow-hidden rounded-full">
                  <div className="bg-yellow-500 h-1 w-1/4 rounded-full" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">3,427</div>
                <p className="text-xs text-muted-foreground mt-1">
                  +18% from last month
                </p>
                <div className="mt-4 h-1 w-full bg-muted overflow-hidden rounded-full">
                  <div className="bg-green-500 h-1 w-4/5 rounded-full" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Record Activity</CardTitle>
              <CardDescription>
                System-wide record activity over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">
                  Chart visualization would go here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <div className="p-6 bg-background min-h-screen">
      {userRole === "patient" && renderPatientView()}
      {userRole === "healthcare" && renderHealthcareView()}
      {userRole === "admin" && renderAdminView()}
    </div>
  );
};

export default HealthRecordPanel;
