import { Helmet } from "react-helmet";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us - temp-mail.lol</title>
        <meta name="description" content="Learn more about our temporary email service, our mission, and how we help protect your privacy online." />
        <meta name="keywords" content="about temp mail, temporary email service, disposable email, email privacy, anonymous email service" />
      </Helmet>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">About temp-mail.lol</h1>
        
        <Card className="p-6 mb-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg">
              temp-mail.lol is a free disposable email service designed to protect your privacy online. Our mission is to provide a simple, reliable way for users to avoid spam, protect their personal email addresses, and maintain anonymity when signing up for online services.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
            <p>
              In today's digital landscape, privacy has become increasingly important yet difficult to maintain. Many websites and services require an email address to register, but this often leads to unwanted marketing emails, data collection, and potential privacy breaches.
            </p>
            <p>
              Our mission is to give users control over their online identity by providing temporary, disposable email addresses that can be used for verifications, sign-ups, and other services without compromising their primary email accounts.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">How It Works</h2>
            <p>
              Using temp-mail.lol is simple: we generate a random email address for you to use wherever you need. All emails sent to this address will appear in your temporary inbox. You can read, forward, or delete these messages as needed, and once you're done, you can simply discard the temporary address.
            </p>
            <p>
              Our service requires no registration, stores no personal data, and is completely free to use.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Key Features</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Instant Email Generation:</strong> Get a disposable email address immediately without registration or personal information.
              </li>
              <li>
                <strong>Custom Email Usernames:</strong> Create personalized email addresses with your chosen username for better organization.
              </li>
              <li>
                <strong>Real-time Email Reception:</strong> All incoming emails appear instantly in your temporary inbox.
              </li>
              <li>
                <strong>Attachment Support:</strong> Receive and download email attachments securely.
              </li>
              <li>
                <strong>Mobile-friendly Design:</strong> Access your temporary emails from any device with a responsive, user-friendly interface.
              </li>
              <li>
                <strong>QR Code Sharing:</strong> Easily access your temporary inbox across devices using our QR code feature.
              </li>
              <li>
                <strong>No Tracking or Data Collection:</strong> We prioritize your privacy and don't store or sell your personal information.
              </li>
            </ul>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Use Cases</h2>
            <p>
              Temporary email addresses are valuable in many situations:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Sign-ups and Registrations:</strong> Create accounts on websites without risking spam to your personal inbox.
              </li>
              <li>
                <strong>One-time Verifications:</strong> Receive verification codes and confirmations without sharing your primary email.
              </li>
              <li>
                <strong>Online Shopping:</strong> Register for e-commerce sites to track orders without getting marketing emails.
              </li>
              <li>
                <strong>Testing Applications:</strong> Developers can test email functionality in their applications without using real addresses.
              </li>
              <li>
                <strong>Protecting Privacy:</strong> Browse the web with greater anonymity by not linking your activities to your personal email.
              </li>
              <li>
                <strong>Avoiding Spam:</strong> Prevent unwanted marketing messages from cluttering your primary inbox.
              </li>
            </ul>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Our Commitment to Privacy</h2>
            <p>
              At temp-mail.lol, we believe privacy is a fundamental right. We're committed to providing a service that respects user privacy by:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Not requiring personal information to use our service</li>
              <li>Not tracking user activity beyond what's necessary for service functionality</li>
              <li>Not selling user data to third parties</li>
              <li>Providing a transparent privacy policy that clearly outlines how we handle data</li>
              <li>Continuously improving our security measures to protect user information</li>
            </ul>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
            <p>
              We value your feedback and are always looking to improve our service. If you have questions, suggestions, or encounter any issues while using temp-mail.lol, please don't hesitate to <Link to="/contact" className="text-primary hover:underline">contact us</Link>.
            </p>
            
            <p className="mt-8 text-sm text-muted-foreground">
              Thank you for choosing temp-mail.lol for your temporary email needs. We're committed to providing a reliable, user-friendly service that helps protect your privacy online.
            </p>
          </div>
        </Card>
        
        <div className="flex justify-center space-x-4 mt-8">
          <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
          <Link to="/faq" className="text-primary hover:underline">FAQ</Link>
        </div>
      </div>
    </>
  );
};

export default About; 