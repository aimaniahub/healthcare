import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Heart,
  Shield,
  Users,
  Calendar,
  FileText,
  MessageSquare,
} from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            Centralized Healthcare Portal
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-indigo-100">
            Secure access to your health records, appointments, and
            communication with healthcare providers.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link to="/login">
              <Button
                size="lg"
                className="bg-white text-indigo-600 hover:bg-indigo-50"
              >
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white/10"
              >
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Comprehensive Healthcare Management
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Everything you need to manage your healthcare in one secure
              platform.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-2 border-blue-100 hover:border-blue-300 transition-colors">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-md flex items-center justify-center bg-blue-500 text-white">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Health Records
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Access and manage your medical records securely from anywhere.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-indigo-100 hover:border-indigo-300 transition-colors">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-md flex items-center justify-center bg-indigo-500 text-white">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Appointments
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Schedule and manage appointments with healthcare providers.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-100 hover:border-purple-300 transition-colors">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-md flex items-center justify-center bg-purple-500 text-white">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Messaging
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Communicate directly with your healthcare team securely.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-pink-100 hover:border-pink-300 transition-colors">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-md flex items-center justify-center bg-pink-500 text-white">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Community
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Connect with others and share experiences in moderated forums.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-100 hover:border-green-300 transition-colors">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-md flex items-center justify-center bg-green-500 text-white">
                  <Heart className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Health Tracking
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Monitor your health metrics and track progress over time.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-100 hover:border-red-300 transition-colors">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-md flex items-center justify-center bg-red-500 text-white">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Secure Access
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Your data is protected with enterprise-grade security
                  measures.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-indigo-200">
              Create your account today.
            </span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link to="/register">
                <Button
                  size="lg"
                  className="bg-white text-indigo-600 hover:bg-indigo-50"
                >
                  Get Started
                </Button>
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-white border-white hover:bg-white/10"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-base text-gray-400">
              &copy; 2023 Health Portal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
