import React from "react";
import { Link } from "wouter";

export function AppFooter() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center mb-4 sm:mb-0">
          </div>
          <div className="flex space-x-4 text-gray-600">
            <Link href="#" className="hover:text-primary transition">
              About
            </Link>
            <Link href="#" className="hover:text-primary transition">
              Privacy
            </Link>
            <Link href="#" className="hover:text-primary transition">
              Terms
            </Link>
            <a href="mailto:reach@wander-notes.com" className="hover:text-primary transition">
              Contact
            </a>
          </div>
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} WanderNotes. Your AI Travel Concierge. All rights reserved.
          </p>
          <p className="mt-1">
            Contact us: <a href="mailto:reach@wander-notes.com" className="hover:text-primary transition">reach@wander-notes.com</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
