import { Helmet } from "react-helmet";

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - Temp-mail.lol</title>
        <meta name="description" content="Our privacy policy explains how we handle your information when you use our temporary email service." />
      </Helmet>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p>
            <strong>Last Updated: May 1, 2024</strong>
          </p>
          
          <p>
            At Temp-mail.lol, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our temporary email service.
          </p>
          
          <h2>Information We Collect</h2>
          <p>
            Our service is designed to collect minimal information. We collect:
          </p>
          <ul>
            <li>Temporary email addresses you generate</li>
            <li>Emails received at those addresses</li>
            <li>Basic usage analytics (page views, service usage patterns)</li>
          </ul>
          <p>
            We do not collect personal identifying information, and we do not require you to create an account or provide any personal details to use our service.
          </p>
          
          <h2>How We Use Information</h2>
          <p>
            The information we collect is used solely to:
          </p>
          <ul>
            <li>Provide the temporary email service</li>
            <li>Maintain and improve our service</li>
            <li>Monitor for abuse or unauthorized use</li>
            <li>Generate anonymous usage statistics</li>
          </ul>
          
          <h2>Data Retention and Security</h2>
          <p>
            All temporary email addresses and their contents are automatically deleted after a period of inactivity (typically 24 hours) or when you leave the site. We employ industry-standard security measures to protect the limited data we do collect, but please note that no method of electronic transmission or storage is 100% secure.
          </p>
          
          <h2>Third-Party Services</h2>
          <p>
            We use minimal third-party services to help operate our website. These may include:
          </p>
          <ul>
            <li>Basic analytics to understand site usage</li>
            <li>Security services to protect against attacks</li>
          </ul>
          <p>
            These third parties have access only to anonymized information necessary to perform their functions and are obligated not to disclose or use it for other purposes.
          </p>
          
          <h2>Your Rights</h2>
          <p>
            Since we collect minimal personal information, most traditional data rights are addressed by our service design. However, you can:
          </p>
          <ul>
            <li>Delete your temporary emails immediately by closing the browser or clearing cookies</li>
            <li>Contact us with concerns about how your data is handled</li>
          </ul>
          
          <h2>Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
          
          <h2>Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at privacy@temp-mail.lol.
          </p>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy; 