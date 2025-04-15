import React, { useState, useEffect } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../contexts/AuthContext";
import {
  getHealthRecords,
  addHealthRecord,
  updateHealthRecord,
  getUsers,
  createAccessRequest,
  getAccessRequests,
  updateAccessRequest,
} from "../lib/api";

interface HealthRecordPanelProps {
  userRole?: "patient" | "healthcare" | "admin";
}

interface HealthRecord {
  id: string;
  patient_id: string;
  title: string;
  record_type: string;
  date: string;
  doctor_id?: string;
  description?: string;
  file_url?: string;
  status: string;
  patient?: {
    id: string;
    display_name: string;
    email: string;
    role: string;
  };
  doctor?: {
    id: string;
    display_name: string;
    email: string;
    role: string;
  };
}

interface AccessRequest {
  id: string;
  requester_id: string;
  patient_id: string;
  record_id?: string;
  status: "pending" | "approved" | "rejected";
  request_reason?: string;
  response_reason?: string;
  created_at: string;
  requester?: {
    id: string;
    display_name: string;
    email: string;
    role: string;
  };
  patient?: {
    id: string;
    display_name: string;
    email: string;
    role: string;
  };
  record?: {
    id: string;
    title: string;
    record_type: string;
    date: string;
  };
}

const HealthRecordPanel = ({
  userRole = "patient",
}: HealthRecordPanelProps) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("records");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<HealthRecord[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [recordTypeFilter, setRecordTypeFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [viewRecordDialogOpen, setViewRecordDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(
    null,
  );
  const [requestAccessDialogOpen, setRequestAccessDialogOpen] = useState(false);
  const [requestReason, setRequestReason] = useState("");

  // Form state for adding a new record
  const [newRecord, setNewRecord] = useState({
    title: "",
    record_type: "lab_result",
    date: new Date().toISOString().split("T")[0],
    patient_id: "",
    description: "",
    file_url: "",
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [userRole, currentUser, selectedPatientId]);

  // Apply filters when search query or record type filter changes
  useEffect(() => {
    applyFilters();
  }, [records, searchQuery, recordTypeFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch users based on role
      if (userRole === "healthcare" || userRole === "admin") {
        const patientsData = await getUsers("patient");
        setPatients(patientsData);
      }

      // Fetch health records
      let recordsData;
      if (userRole === "patient" || !selectedPatientId) {
        recordsData = await getHealthRecords();
      } else {
        recordsData = await getHealthRecords(selectedPatientId);
      }
      setRecords(recordsData);

      // Fetch access requests
      const requestsData = await getAccessRequests();
      setAccessRequests(requestsData);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load data. Please try again.",
      });
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...records];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.title.toLowerCase().includes(query) ||
          record.description?.toLowerCase().includes(query) ||
          record.record_type.toLowerCase().includes(query) ||
          record.patient?.display_name.toLowerCase().includes(query) ||
          record.doctor?.display_name.toLowerCase().includes(query),
      );
    }

    // Apply record type filter
    if (recordTypeFilter) {
      filtered = filtered.filter(
        (record) => record.record_type === recordTypeFilter,
      );
    }

    setFilteredRecords(filtered);
  };

  const handleAddRecord = async () => {
    try {
      // Validate form
      if (!newRecord.title || !newRecord.date || !newRecord.record_type) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please fill in all required fields.",
        });
        return;
      }

      // Prepare record data
      const recordData = {
        ...newRecord,
        doctor_id: currentUser?.uid,
        patient_id: newRecord.patient_id || currentUser?.uid,
        status: "active",
      };

      // Add record to database
      await addHealthRecord(recordData);

      // Reset form and close dialog
      setNewRecord({
        title: "",
        record_type: "lab_result",
        date: new Date().toISOString().split("T")[0],
        patient_id: "",
        description: "",
        file_url: "",
      });
      setUploadDialogOpen(false);

      // Refresh data
      fetchData();

      toast({
        title: "Success",
        description: "Health record added successfully.",
      });
    } catch (error) {
      console.error("Error adding record:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add record. Please try again.",
      });
    }
  };

  const handleViewRecord = (record: HealthRecord) => {
    setSelectedRecord(record);
    setViewRecordDialogOpen(true);
  };

  const handleRequestAccess = async () => {
    if (!selectedRecord || !requestReason) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please provide a reason for requesting access.",
      });
      return;
    }

    try {
      await createAccessRequest(
        selectedRecord.patient_id,
        selectedRecord.id,
        requestReason,
      );

      setRequestAccessDialogOpen(false);
      setRequestReason("");

      toast({
        title: "Access Requested",
        description: "Your request has been submitted for approval.",
      });

      // Refresh access requests
      fetchData();
    } catch (error) {
      console.error("Error requesting access:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit access request. Please try again.",
      });
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      await updateAccessRequest(requestId, "approved", "Access granted");
      toast({
        title: "Request Approved",
        description: "Access request has been approved.",
      });
      fetchData();
    } catch (error) {
      console.error("Error approving request:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve request. Please try again.",
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await updateAccessRequest(requestId, "rejected", "Access denied");
      toast({
        title: "Request Rejected",
        description: "Access request has been rejected.",
      });
      fetchData();
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reject request. Please try again.",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRecordTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      lab_result: "Lab Result",
      prescription: "Prescription",
      diagnosis: "Diagnosis",
      imaging: "Imaging",
      vaccination: "Vaccination",
      surgery: "Surgery",
      consultation: "Consultation",
      other: "Other",
    };
    return types[type] || type;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "archived":
        return <Badge className="bg-gray-500">Archived</Badge>;
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
                <Select
                  value={newRecord.record_type}
                  onValueChange={(value) =>
                    setNewRecord({ ...newRecord, record_type: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lab_result">Lab Results</SelectItem>
                    <SelectItem value="prescription">Prescription</SelectItem>
                    <SelectItem value="diagnosis">Diagnosis</SelectItem>
                    <SelectItem value="imaging">Imaging</SelectItem>
                    <SelectItem value="vaccination">Vaccination</SelectItem>
                    <SelectItem value="surgery">Surgery</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  className="col-span-3"
                  value={newRecord.title}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, title: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  className="col-span-3"
                  value={newRecord.date}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, date: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  className="col-span-3"
                  placeholder="Additional information..."
                  value={newRecord.description}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, description: e.target.value })
                  }
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
              <Button onClick={handleAddRecord}>Submit Request</Button>
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
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <p>Loading records...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Doctor</TableHead>
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
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell>
                        {record.doctor?.display_name || "N/A"}
                      </TableCell>
                      <TableCell>
                        {getRecordTypeLabel(record.record_type)}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewRecord(record)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {record.file_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                window.open(record.file_url, "_blank")
                              }
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No records found. Try adjusting your search or request a
                      new record.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Record Dialog */}
      <Dialog
        open={viewRecordDialogOpen}
        onOpenChange={setViewRecordDialogOpen}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedRecord?.title}</DialogTitle>
            <DialogDescription>
              {getRecordTypeLabel(selectedRecord?.record_type || "")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Date</Label>
                <p>{selectedRecord && formatDate(selectedRecord.date)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Doctor</Label>
                <p>{selectedRecord?.doctor?.display_name || "N/A"}</p>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Description</Label>
              <p className="mt-1">{selectedRecord?.description || "N/A"}</p>
            </div>
          </div>
          <DialogFooter>
            {selectedRecord?.file_url && (
              <Button
                variant="outline"
                onClick={() => window.open(selectedRecord.file_url, "_blank")}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Document
              </Button>
            )}
            <Button
              onClick={() => setViewRecordDialogOpen(false)}
              variant="secondary"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderHealthcareWorkerView = () => (
    <div className="space-y-6 bg-white">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Health Records Management</h2>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Add Record
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Health Record</DialogTitle>
              <DialogDescription>
                Enter the details for the new health record.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="col-span-1">
                  Title
                </Label>
                <Input
                  id="title"
                  className="col-span-3"
                  value={newRecord.title}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="record-type" className="col-span-1">
                  Type
                </Label>
                <Select
                  value={newRecord.record_type}
                  onValueChange={(value) =>
                    setNewRecord({ ...newRecord, record_type: value })
                  }
                >
                  <SelectTrigger id="record-type" className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lab_result">Lab Result</SelectItem>
                    <SelectItem value="prescription">Prescription</SelectItem>
                    <SelectItem value="diagnosis">Diagnosis</SelectItem>
                    <SelectItem value="imaging">Imaging</SelectItem>
                    <SelectItem value="vaccination">Vaccination</SelectItem>
                    <SelectItem value="surgery">Surgery</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="col-span-1">
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  className="col-span-3"
                  value={newRecord.date}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="patient" className="col-span-1">
                  Patient
                </Label>
                <Select
                  value={newRecord.patient_id}
                  onValueChange={(value) =>
                    setNewRecord({ ...newRecord, patient_id: value })
                  }
                >
                  <SelectTrigger id="patient" className="col-span-3">
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file-url" className="col-span-1">
                  File URL
                </Label>
                <Input
                  id="file-url"
                  className="col-span-3"
                  value={newRecord.file_url}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, file_url: e.target.value })
                  }
                  placeholder="https://example.com/file.pdf"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="col-span-1">
                  Description
                </Label>
                <Textarea
                  id="description"
                  className="col-span-3"
                  value={newRecord.description}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, description: e.target.value })
                  }
                  rows={4}
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
              <Button onClick={handleAddRecord}>Add Record</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search records..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={recordTypeFilter} onValueChange={setRecordTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="lab_result">Lab Results</SelectItem>
            <SelectItem value="prescription">Prescriptions</SelectItem>
            <SelectItem value="diagnosis">Diagnoses</SelectItem>
            <SelectItem value="imaging">Imaging</SelectItem>
            <SelectItem value="vaccination">Vaccinations</SelectItem>
            <SelectItem value="surgery">Surgeries</SelectItem>
            <SelectItem value="consultation">Consultations</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select patient" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Patients</SelectItem>
            {patients.map((patient) => (
              <SelectItem key={patient.id} value={patient.id}>
                {patient.display_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="records">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="records">Records</TabsTrigger>
          <TabsTrigger value="access">Access Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="mt-4">
          <Card>
            <CardContent className="p-6">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <p>Loading records...</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Record</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Patient</TableHead>
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
                            <TableCell>
                              <Badge variant="outline">
                                {getRecordTypeLabel(record.record_type)}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(record.date)}</TableCell>
                            <TableCell>
                              {record.patient?.display_name || "N/A"}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewRecord(record)}
                                >
                                  <Eye size={14} className="mr-1" />
                                  View
                                </Button>
                                {record.file_url && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      window.open(record.file_url, "_blank")
                                    }
                                  >
                                    <Download size={14} className="mr-1" />
                                    Download
                                  </Button>
                                )}
                                {record.doctor_id !== currentUser?.uid && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                                      >
                                        <Clock size={14} className="mr-1" />
                                        Request Access
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Request Access to Record
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Please provide a reason for requesting
                                          access to this record.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <div className="py-4">
                                        <Label htmlFor="request-reason">
                                          Reason for Request
                                        </Label>
                                        <Textarea
                                          id="request-reason"
                                          className="mt-2"
                                          value={requestReason}
                                          onChange={(e) =>
                                            setRequestReason(e.target.value)
                                          }
                                          placeholder="I need access to this record to provide better care for the patient."
                                          rows={4}
                                        />
                                      </div>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => {
                                            setSelectedRecord(record);
                                            handleRequestAccess();
                                          }}
                                        >
                                          Submit Request
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No records found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="mt-4">
          <Card>
            <CardContent className="p-6">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <p>Loading access requests...</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Record</TableHead>
                        <TableHead>Date Requested</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accessRequests.length > 0 ? (
                        accessRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">
                              {request.patient?.display_name || "Unknown"}
                            </TableCell>
                            <TableCell>
                              {request.record?.title || "All Records"}
                            </TableCell>
                            <TableCell>
                              {formatDate(request.created_at)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  request.status === "approved"
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : request.status === "rejected"
                                      ? "bg-red-100 text-red-800 border-red-200"
                                      : "bg-yellow-100 text-yellow-800 border-yellow-200"
                                }
                              >
                                {request.status.charAt(0).toUpperCase() +
                                  request.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-800"
                                onClick={() => {
                                  toast({
                                    title: "Request Reason",
                                    description:
                                      request.request_reason ||
                                      "No reason provided",
                                  });
                                }}
                              >
                                View Reason
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No access requests found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Record Dialog */}
      <Dialog
        open={viewRecordDialogOpen}
        onOpenChange={setViewRecordDialogOpen}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedRecord?.title}</DialogTitle>
            <DialogDescription>
              {getRecordTypeLabel(selectedRecord?.record_type || "")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-muted-foreground">Date</Label>
                <p>{selectedRecord && formatDate(selectedRecord.date)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Patient</Label>
                <p>{selectedRecord?.patient?.display_name || "N/A"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Doctor</Label>
                <p>{selectedRecord?.doctor?.display_name || "N/A"}</p>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Description</Label>
              <p className="mt-1">{selectedRecord?.description || "N/A"}</p>
            </div>
          </div>
          <DialogFooter>
            {selectedRecord?.file_url && (
              <Button
                variant="outline"
                onClick={() => window.open(selectedRecord.file_url, "_blank")}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Document
              </Button>
            )}
            <Button
              onClick={() => setViewRecordDialogOpen(false)}
              variant="secondary"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
              <Button onClick={() => setUploadDialogOpen(true)}>
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
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <p>Loading records...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Doctor</TableHead>
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
                              <AvatarFallback>
                                {record.patient?.display_name?.charAt(0) || "P"}
                              </AvatarFallback>
                            </Avatar>
                            <span>
                              {record.patient?.display_name || "Unknown"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {record.title}
                        </TableCell>
                        <TableCell>{formatDate(record.date)}</TableCell>
                        <TableCell>
                          {record.doctor?.display_name || "N/A"}
                        </TableCell>
                        <TableCell>
                          {getRecordTypeLabel(record.record_type)}
                        </TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewRecord(record)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Edit functionality would go here
                                toast({
                                  title: "Edit Record",
                                  description:
                                    "Edit functionality not implemented yet.",
                                });
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {record.file_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  window.open(record.file_url, "_blank")
                                }
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
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
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <p>Loading access requests...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Requestor</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Record</TableHead>
                      <TableHead>Date Requested</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accessRequests.length > 0 ? (
                      accessRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback>
                                  {request.requester?.display_name?.charAt(0) ||
                                    "R"}
                                </AvatarFallback>
                              </Avatar>
                              <span>
                                {request.requester?.display_name || "Unknown"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback>
                                  {request.patient?.display_name?.charAt(0) ||
                                    "P"}
                                </AvatarFallback>
                              </Avatar>
                              <span>
                                {request.patient?.display_name || "Unknown"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {request.record?.title || "All Records"}
                          </TableCell>
                          <TableCell>
                            {formatDate(request.created_at)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                request.status === "approved"
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : request.status === "rejected"
                                    ? "bg-red-100 text-red-800 border-red-200"
                                    : "bg-yellow-100 text-yellow-800 border-yellow-200"
                              }
                            >
                              {request.status.charAt(0).toUpperCase() +
                                request.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {request.status === "pending" && (
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border-green-200"
                                  onClick={() =>
                                    handleApproveRequest(request.id)
                                  }
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
                                  onClick={() =>
                                    handleRejectRequest(request.id)
                                  }
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-800"
                              onClick={() => {
                                toast({
                                  title: "Request Reason",
                                  description:
                                    request.request_reason ||
                                    "No reason provided",
                                });
                              }}
                            >
                              View Reason
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No access requests found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
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
                <div className="text-3xl font-bold">{records.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total records in the system
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
                <div className="text-3xl font-bold">
                  {accessRequests.filter((r) => r.status === "pending").length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Pending access requests
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
                <div className="text-3xl font-bold">{patients.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Registered patients
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

      {/* View Record Dialog */}
      <Dialog
        open={viewRecordDialogOpen}
        onOpenChange={setViewRecordDialogOpen}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedRecord?.title}</DialogTitle>
            <DialogDescription>
              {getRecordTypeLabel(selectedRecord?.record_type || "")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-muted-foreground">Date</Label>
                <p>{selectedRecord && formatDate(selectedRecord.date)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Patient</Label>
                <p>{selectedRecord?.patient?.display_name || "N/A"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Doctor</Label>
                <p>{selectedRecord?.doctor?.display_name || "N/A"}</p>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Description</Label>
              <p className="mt-1">{selectedRecord?.description || "N/A"}</p>
            </div>
          </div>
          <DialogFooter>
            {selectedRecord?.file_url && (
              <Button
                variant="outline"
                onClick={() => window.open(selectedRecord.file_url, "_blank")}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Document
              </Button>
            )}
            <Button
              onClick={() => setViewRecordDialogOpen(false)}
              variant="secondary"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  return (
    <div className="p-6 bg-background min-h-screen">
      {userRole === "patient" && renderPatientView()}
      {userRole === "healthcare" && renderHealthcareWorkerView()}
      {userRole === "admin" && renderAdminView()}
    </div>
  );
};

export default HealthRecordPanel;
