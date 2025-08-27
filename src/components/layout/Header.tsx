import { useState } from "react";
import { Search, Shield, X, BarChart3, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@tanstack/react-router";

interface HeaderProps {
	onSearchChange?: (query: string) => void;
}

export const Header = ({ onSearchChange }: HeaderProps) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [isSearchFocused, setIsSearchFocused] = useState(false);

	const handleSearchChange = (
		event: React.ChangeEvent<HTMLInputElement>
	): void => {
		const value = event.target.value;
		setSearchQuery(value);
		onSearchChange?.(value);
	};

	const handleKeyDown = (event: React.KeyboardEvent): void => {
		if (event.key === "Escape") {
			setSearchQuery("");
			onSearchChange?.("");
		}
	};

	return (
		<header
			className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
			role="banner"
		>
			{/* Emergency Alert Banner */}
			<div
				aria-live="polite"
				className="bg-gradient-to-r from-red-500 to-red-600 px-3 py-2 text-center text-white text-sm font-medium"
				role="alert"
			>
				<div className="flex items-center justify-center gap-2">
					<Shield aria-hidden="true" className="h-4 w-4" />
					<span>
						Emergency Dashboard Active - Last Updated:{" "}
						{new Date().toLocaleTimeString()}
					</span>
				</div>
			</div>

			{/* Main Header */}
			<div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-7xl">
				{/* Logo and Brand */}
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-3">
						<div
							aria-label="The Guardians Emergency Dashboard Logo"
							className="flex h-12 w-12 items-center justify-center rounded-lg overflow-hidden bg-transparent"
							role="img"
						>
							<img
								alt="The Guardians Logo"
								className="h-20 w-20 object-contain"
								src="/logo.png"
								onError={(e) => {
									// Fallback to Shield icon if logo fails to load
									const target = e.target as HTMLImageElement;
									target.style.display = "none";
									const parent = target.parentElement;
									if (parent) {
										parent.className =
											"flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg";
										parent.innerHTML =
											'<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>';
									}
								}}
							/>
						</div>
						<div className="hidden sm:block">
							<h1 className="text-lg font-bold text-gray-900 tracking-tight">
								The Guardians
							</h1>
							<p className="text-xs text-gray-600 -mt-1 font-medium">
								Emergency monitoring system
							</p>
						</div>
					</div>
				</div>

				{/* Main Navigation - Desktop */}
				<nav
					aria-label="Main navigation"
					className="hidden lg:flex items-center gap-1"
					role="navigation"
				>
					<Link
						className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
						to="/"
						activeProps={{
							className:
								"flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg",
						}}
					>
						<Home className="h-4 w-4" />
						Dashboard
					</Link>
					<Link
						className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
						to="/analytics"
						activeProps={{
							className:
								"flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg",
						}}
					>
						<BarChart3 className="h-4 w-4" />
						Analytics
					</Link>
				</nav>

				{/* Search Bar */}
				<div className="hidden md:flex items-center gap-3 flex-1 max-w-md mx-6">
					<div
						className={`relative flex-1 transition-all duration-300 ${
							isSearchFocused ? "scale-105" : ""
						}`}
					>
						<label className="sr-only" htmlFor="search-input">
							Search regions and alerts
						</label>
						<Search
							aria-hidden="true"
							className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
						/>
						<Input
							aria-describedby="search-help"
							id="search-input"
							placeholder="Search regions, alerts..."
							type="search"
							value={searchQuery}
							className={`input-modern pl-10 transition-all duration-300 ${
								isSearchFocused
									? "ring-2 ring-blue-500/20 shadow-lg border-blue-300 scale-105"
									: "border-gray-200"
							}`}
							onChange={handleSearchChange}
							onKeyDown={handleKeyDown}
							onBlur={() => {
								setIsSearchFocused(false);
							}}
							onFocus={() => {
								setIsSearchFocused(true);
							}}
						/>
						<div className="sr-only" id="search-help">
							Search for emergency regions, alerts, and local government areas.
							Press Escape to clear.
						</div>
						{searchQuery && (
							<Button
								aria-label="Clear search"
								className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
								size="sm"
								variant="ghost"
								onClick={() => {
									setSearchQuery("");
									onSearchChange?.("");
								}}
							>
								<X className="h-3 w-3" />
							</Button>
						)}
					</div>
				</div>

				{/* Actions */}
				<div className="flex items-center gap-2">
					{/* No additional action buttons */}
				</div>
			</div>
		</header>
	);
};
