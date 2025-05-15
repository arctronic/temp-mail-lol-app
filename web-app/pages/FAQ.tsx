import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
}

const FAQ = () => {
  const [openItem, setOpenItem] = useState<number | null>(0); // Default to first question open

  const faqItems: FAQItem[] = [
    {
      question: "What is a temporary email service?",
      answer: (
        <div className="space-y-2">
          <p>A temporary email service provides disposable email addresses that can be used to receive emails for a limited time. These services help protect your privacy, avoid spam, and keep your primary inbox clean.</p>
          <p>Unlike permanent email accounts, temporary emails are designed to be used for short-term purposes like website registrations, one-time verifications, or receiving promotional content without revealing your personal email address.</p>
        </div>
      )
    },
    {
      question: "Is temp-mail.lol really free?",
      answer: (
        <div className="space-y-2">
          <p>Yes, temp-mail.lol is completely free to use. There are no hidden fees, premium features that require payment, or subscription models.</p>
          <p>We believe in providing a valuable privacy service that should be accessible to everyone without financial barriers. Our service is supported through minimal, non-intrusive advertisements that don't compromise your user experience.</p>
        </div>
      )
    },
    {
      question: "How long do temporary emails last?",
      answer: (
        <div className="space-y-2">
          <p>Emails in your temporary inbox remain available as long as you keep the browser tab open. Once you close or refresh the page, the emails are no longer accessible unless you've saved the specific email address.</p>
          <p>To maintain access to a specific temporary address for longer periods, you can bookmark the page or use our QR code feature to quickly access the same inbox from another device. However, even with these methods, temporary emails are not designed for long-term storage, and we recommend downloading or forwarding any important messages to your permanent email.</p>
        </div>
      )
    },
    {
      question: "Can I send emails from my temporary address?",
      answer: (
        <div className="space-y-2">
          <p>Currently, temp-mail.lol only supports receiving emails. You cannot send emails from your temporary address.</p>
          <p>This limitation is by design to prevent abuse and maintain the core functionality of providing disposable receiving addresses. If you need to respond to an email, we recommend using your primary email client or a different service designed for sending messages.</p>
        </div>
      )
    },
    {
      question: "Is it safe to use a temporary email?",
      answer: (
        <div className="space-y-2">
          <p>Yes, using a temporary email for sign-ups and verifications is safe and can actually enhance your online privacy by reducing spam and preventing your primary email from being exposed in data breaches.</p>
          <p>temp-mail.lol employs several security measures to ensure your experience is safe:</p>
          <ul className="list-disc pl-5">
            <li>We don't collect personal information</li>
            <li>All data is temporary and not permanently stored</li>
            <li>We use HTTPS encryption for all connections</li>
            <li>Our service helps prevent tracking through email pixels and other tracking mechanisms</li>
          </ul>
          <p>However, we recommend not using temporary emails for sensitive or important accounts like banking, government services, or primary social media profiles where long-term access is necessary.</p>
        </div>
      )
    },
    {
      question: "Can I choose my own email address?",
      answer: (
        <div className="space-y-2">
          <p>Yes, you can customize the username portion of your temporary email address. However, the domain name will remain @temp-mail.lol.</p>
          <p>To create a custom username:</p>
          <ol className="list-decimal pl-5">
            <li>Visit the homepage</li>
            <li>Enter your desired username in the email input field</li>
            <li>The system will automatically update your temporary email address</li>
          </ol>
          <p>Custom usernames must be at least 6 characters long and can only contain letters and numbers.</p>
        </div>
      )
    },
    {
      question: "Will I miss important emails if I use a temporary address?",
      answer: (
        <div className="space-y-2">
          <p>If you're expecting important or time-sensitive emails, it's best to use your primary email address. Temporary email addresses are ideal for one-time verifications, subscriptions, or situations where you may not need to receive future communications.</p>
          <p>Since temporary emails have limited persistence, there's a risk of losing access to important messages if your browser session ends. For critical communications like job applications, financial services, or important personal correspondence, we recommend using your permanent email address.</p>
        </div>
      )
    },
    {
      question: "Are attachments supported?",
      answer: (
        <div className="space-y-2">
          <p>Yes, temp-mail.lol supports receiving emails with attachments. You can view and download these attachments directly from your temporary inbox.</p>
          <p>We support common file types including documents, images, PDFs, and compressed archives. For security reasons, executable files may be blocked. There's also a file size limit of 25MB per attachment, which is standard for most email services.</p>
          <p>Downloaded attachments are processed entirely on your device, and we don't store copies of your files on our servers beyond the temporary email session.</p>
        </div>
      )
    },
    {
      question: "How private is this service?",
      answer: (
        <div className="space-y-2">
          <p>We respect your privacy and do not collect or store any personal information. All email data is temporary and deleted once you leave the site or after a certain period of inactivity.</p>
          <p>Key privacy features include:</p>
          <ul className="list-disc pl-5">
            <li>No account registration required</li>
            <li>No personal information collected</li>
            <li>No logging of IP addresses for identification purposes</li>
            <li>No tracking cookies for marketing purposes</li>
            <li>Temporary data storage only</li>
          </ul>
          <p>You can learn more about our privacy practices in our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.</p>
        </div>
      )
    },
    {
      question: "Can I access my temporary email from multiple devices?",
      answer: (
        <div className="space-y-2">
          <p>Yes, if you need to access your temporary email from another device, you can use the QR code feature to quickly open the same inbox on your mobile device.</p>
          <p>To use this feature:</p>
          <ol className="list-decimal pl-5">
            <li>On your desktop/initial device, click the "QR" button next to your temporary email address</li>
            <li>A QR code will appear containing your unique email address</li>
            <li>Scan this code with your second device's camera</li>
            <li>The scan will open our website with the same temporary email address active</li>
          </ol>
          <p>This feature is particularly useful if you're signing up for a service on your computer but need to receive verification codes on your mobile device.</p>
        </div>
      )
    },
    {
      question: "What should I do if I'm not receiving expected emails?",
      answer: (
        <div className="space-y-2">
          <p>If you're not receiving expected emails in your temporary inbox, here are some troubleshooting steps:</p>
          <ol className="list-decimal pl-5">
            <li>Verify that the correct email address was used for registration</li>
            <li>Check that the sender's domain isn't blocked by our service (some services block emails to known temporary email providers)</li>
            <li>Wait a few minutes as email delivery can sometimes be delayed</li>
            <li>Refresh your inbox using the refresh button</li>
            <li>Ensure your browser tab has remained open since creating the temporary address</li>
          </ol>
          <p>If you've tried these steps and still aren't receiving expected emails, you may want to try a different username or contact us for assistance.</p>
        </div>
      )
    },
    {
      question: "Can services detect that I'm using a temporary email?",
      answer: (
        <div className="space-y-2">
          <p>Yes, some websites and services maintain lists of known temporary email domains and may block registrations from these addresses. This is done to prevent abuse and ensure they have a way to contact users long-term.</p>
          <p>If you encounter a service that blocks temp-mail.lol addresses, you have a few options:</p>
          <ul className="list-disc pl-5">
            <li>Use a different temporary email service that might not be on their blocklist</li>
            <li>Consider whether this service actually requires your permanent email (for account recovery, important notifications, etc.)</li>
            <li>If it's a service you'll use long-term, it might be worth using your permanent email</li>
          </ul>
        </div>
      )
    },
    {
      question: "Is it legal to use temporary email addresses?",
      answer: (
        <div className="space-y-2">
          <p>Yes, using temporary email addresses is completely legal in most jurisdictions. These services exist to protect your privacy, which is a legitimate concern in the digital age.</p>
          <p>However, how you use temporary emails matters. Using them to:</p>
          <ul className="list-disc pl-5">
            <li>Avoid spam and protect privacy: Legal and encouraged</li>
            <li>Create multiple accounts to violate a service's terms: Potentially against terms of service</li>
            <li>Engage in fraudulent activities: Illegal regardless of email type</li>
          </ul>
          <p>Always use temporary email services responsibly and in accordance with each service's terms of use.</p>
        </div>
      )
    },
    {
      question: "How does temp-mail.lol compare to other temporary email services?",
      answer: (
        <div className="space-y-2">
          <p>temp-mail.lol offers several advantages compared to other temporary email services:</p>
          <ul className="list-disc pl-5">
            <li><strong>Clean, Modern Interface:</strong> Our user interface is designed for simplicity and ease of use</li>
            <li><strong>No Registration:</strong> Unlike some services that require sign-up, we provide instant access</li>
            <li><strong>Attachment Support:</strong> We fully support email attachments, which some temporary services don't</li>
            <li><strong>Custom Usernames:</strong> You can choose your own username rather than using only randomly generated addresses</li>
            <li><strong>QR Code Sharing:</strong> Easily access your inbox across multiple devices</li>
            <li><strong>Privacy Focus:</strong> We prioritize user privacy with minimal tracking and temporary data storage</li>
            <li><strong>Mobile-Friendly Design:</strong> Our responsive design works well on all devices</li>
          </ul>
        </div>
      )
    }
  ];

  const toggleItem = (index: number) => {
    setOpenItem(openItem === index ? null : index);
  };

  return (
    <>
      <Helmet>
        <title>Frequently Asked Questions - temp-mail.lol</title>
        <meta name="description" content="Find answers to common questions about our temporary email service, including how to use it, privacy concerns, and technical details." />
        <meta name="keywords" content="temporary email FAQ, disposable email questions, temp mail help, privacy protection email, anonymous email service" />
      </Helmet>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Frequently Asked Questions</h1>
        
        <p className="text-lg mb-8">
          Find answers to common questions about our temporary email service. If your question isn't answered here, please visit our <Link to="/contact" className="text-primary hover:underline">Contact page</Link> for additional support.
        </p>
        
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div 
              key={index}
              className="border border-border rounded-lg overflow-hidden transition-all duration-200 hover:border-primary/50"
            >
              <button
                onClick={() => toggleItem(index)}
                className={cn(
                  "flex items-center justify-between w-full p-4 text-left transition-colors",
                  openItem === index ? "bg-muted" : ""
                )}
                aria-expanded={openItem === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="font-medium">{item.question}</span>
                <ChevronDown className={cn(
                  "h-5 w-5 transition-transform duration-300",
                  openItem === index ? "transform rotate-180" : ""
                )} />
              </button>
              <div 
                id={`faq-answer-${index}`}
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  openItem === index ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <div className="p-4 pt-2 border-t border-border">
                  <div className="text-muted-foreground">{item.answer}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 p-6 border border-border rounded-lg bg-muted/30">
          <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
          <p className="mb-4">
            If you couldn't find the answer you were looking for, we're here to help. Feel free to reach out to our team for assistance.
          </p>
          <Link 
            to="/contact" 
            className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </>
  );
};

export default FAQ; 