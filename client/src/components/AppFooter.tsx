import React from "react";
import { Link } from "wouter";

export function AppFooter() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center mb-4 sm:mb-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-gray-800 font-medium">
              Wander Notes by TabTapAI PTE LTD Singapore
            </span>
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
            © 2025 Wander Notes by TabTapAI PTE LTD Singapore. All rights reserved.
          </p>
          <p className="mt-1">
            Contact us: <a href="mailto:reach@wander-notes.com" className="hover:text-primary transition">reach@wander-notes.com</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
