import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  Calendar,
  FileText,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../contexts/AuthContext";
import HealthRecordPanel from "./HealthRecordPanel";
import AppointmentPanel from "./AppointmentPanel";
import MessagingPanel from "./MessagingPanel";
import CommunityPanel from "./CommunityPanel";

interface HomeProps {
  userRole?: "patient" | "healthcare" | "admin";
  userName?: string;
}

const Home = ({ userName }: HomeProps) => {
  const [activeTab, setActiveTab] = useState("health-records");
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get user role from auth context
  const userRole = currentUser?.role || "patient";

  // Get user name from auth context or props
  const displayName = currentUser?.displayName || userName || "User";

  // Get first letter of first and last name for avatar fallback
  const getInitials = (name: string) => {
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`;
    }
    return names[0][0] || "U";
  };

  const roleLabel = {
    patient: "Patient",
    healthcare: "Healthcare Worker",
    admin: "Administrator",
  }[userRole];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      console.error("Failed to log out", error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "There was a problem logging out. Please try again.",
      });
    }
  };

  // Set the document title based on active tab
  useEffect(() => {
    const tabTitles = {
      "health-records": "Health Records",
      appointments: "Appointments",
      messaging: "Messaging",
      community: "Community",
    };
    document.title = `Health Portal | ${tabTitles[activeTab as keyof typeof tabTitles]}`;
  }, [activeTab]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Mobile Navigation */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden absolute top-4 left-4 z-10"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full bg-card">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
              <h2 className="text-2xl font-bold">Health Portal</h2>
              <p className="text-blue-100 text-sm">{roleLabel}</p>
            </div>
            <Separator />
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                <li>
                  <Button
                    variant={
                      activeTab === "health-records" ? "secondary" : "ghost"
                    }
                    className="w-full justify-start"
                    onClick={() => setActiveTab("health-records")}
                  >
                    <FileText className="mr-2 h-5 w-5" />
                    Health Records
                  </Button>
                </li>
                <li>
                  <Button
                    variant={
                      activeTab === "appointments" ? "secondary" : "ghost"
                    }
                    className="w-full justify-start"
                    onClick={() => setActiveTab("appointments")}
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Appointments
                  </Button>
                </li>
                <li>
                  <Button
                    variant={activeTab === "messaging" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("messaging")}
                  >
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Messaging
                  </Button>
                </li>
                <li>
                  <Button
                    variant={activeTab === "community" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("community")}
                  >
                    <Users className="mr-2 h-5 w-5" />
                    Community
                  </Button>
                </li>
              </ul>
            </nav>
            <div className="p-4">
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="mr-2 h-5 w-5" />
                Settings
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col bg-white border-r shadow-sm">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <h2 className="text-2xl font-bold">Health Portal</h2>
          <p className="text-blue-100 text-sm">{roleLabel}</p>
        </div>
        <Separator />
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Button
                variant={activeTab === "health-records" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("health-records")}
              >
                <FileText className="mr-2 h-5 w-5" />
                Health Records
              </Button>
            </li>
            <li>
              <Button
                variant={activeTab === "appointments" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("appointments")}
              >
                <Calendar className="mr-2 h-5 w-5" />
                Appointments
              </Button>
            </li>
            <li>
              <Button
                variant={activeTab === "messaging" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("messaging")}
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Messaging
              </Button>
            </li>
            <li>
              <Button
                variant={activeTab === "community" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("community")}
              >
                <Users className="mr-2 h-5 w-5" />
                Community
              </Button>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-5 w-5" />
            Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b flex items-center justify-between px-6 bg-white shadow-sm">
          <h1 className="text-xl font-semibold md:ml-0 ml-8 text-gray-800">
            {activeTab === "health-records" && "Health Records"}
            {activeTab === "appointments" && "Appointments"}
            {activeTab === "messaging" && "Messaging"}
            {activeTab === "community" && "Community"}
          </h1>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            </Button>
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`}
                  alt={displayName}
                />
                <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">{roleLabel}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-6">
              {activeTab === "health-records" && (
                <HealthRecordPanel userRole={userRole} />
              )}
              {activeTab === "appointments" && (
                <AppointmentPanel userRole={userRole} />
              )}
              {activeTab === "messaging" && <MessagingPanel />}
              {activeTab === "community" && (
                <CommunityPanel userRole={userRole} />
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Home;
