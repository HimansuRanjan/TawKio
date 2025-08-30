import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Signup = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-700 via-blue-600 to-violet-900">
      <Card className="w-full max-w-md bg-white/10 text-white backdrop-blur-xl shadow-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold">
            Create Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4">
            <Input
              type="text"
              placeholder="Username"
              className="bg-white/20 border-white/30 rounded-full text-white placeholder-gray-300"
            />
            <Input
              type="email"
              placeholder="Email"
              className="bg-white/20 border-white/30 rounded-full text-white placeholder-gray-300"
            />
            <Input
              type="password"
              placeholder="Password"
              className="bg-white/20 border-white/30 rounded-full text-white placeholder-gray-300"
            />
            <Button className="w-full bg-slate-50 hover:bg-gray-400 text-violet-900 font-semibold rounded-full">
              Sign Up
            </Button>
          </form>
          <p className="text-center text-sm text-gray-300 mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-yellow-300 hover:underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
