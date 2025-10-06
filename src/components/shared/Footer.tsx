import { footerLinks } from "@/lib/data"
import Link from "next/link"

const Footer = () => {
    return (
        <footer className="py-12 md:py-16 bg-black text-muted-foreground">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="mb-8">Questions? Call <Link href="tel:000-800-919-1694" className="hover:underline">000-800-919-1694</Link></p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-sm">
                    {footerLinks.map((link) => (
                        <Link href="#" key={link} className="hover:underline">{link}</Link>
                    ))}
                </div>
                <p className="mt-8 text-sm">StreamClone</p>
            </div>
        </footer>
    )
}

export default Footer;
