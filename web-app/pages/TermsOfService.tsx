import { Helmet } from "react-helmet";

const TermsOfService = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service - temp-mail.lol</title>
        <meta name="description" content="Read our terms of service to understand the rules and guidelines for using our temporary email service." />
      </Helmet>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p>
            <strong>Last Updated: May 1, 2024</strong>
          </p>
          
          <p>
            Welcome to temp-mail.lol. By accessing or using our service, you agree to be bound by these Terms of Service ("Terms"). Please read them carefully.
          </p>
          
          <h2>Service Description</h2>
          <p>
            temp-mail.lol provides a temporary email service that allows users to create disposable email addresses for receiving emails without revealing their personal email addresses.
          </p>
          
          <h2>Acceptable Use</h2>
          <p>
            You agree not to use temp-mail.lol for:
          </p>
          <ul>
            <li>Any illegal activities</li>
            <li>Spamming or mass mailing</li>
            <li>Harassing, threatening, or harming others</li>
            <li>Infringing on intellectual property rights</li>
            <li>Attempting to gain unauthorized access to our systems</li>
            <li>Distributing malware or other harmful code</li>
            <li>Any activity that could disrupt or impair the service</li>
          </ul>
          
          <h2>Service Limitations</h2>
          <p>
            temp-mail.lol is provided as-is with the following limitations:
          </p>
          <ul>
            <li>Emails are automatically deleted after a period of inactivity</li>
            <li>We cannot guarantee delivery of all emails</li>
            <li>Some websites may block our email domains</li>
            <li>The service may have usage limits to prevent abuse</li>
            <li>We may implement measures to prevent automated or abusive usage</li>
          </ul>
          
          <h2>No Warranty</h2>
          <p>
            THE SERVICE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SERVICE OR THE USE OR OTHER DEALINGS IN THE SERVICE.
          </p>
          
          <h2>Changes to the Service</h2>
          <p>
            We reserve the right to modify or discontinue, temporarily or permanently, the service (or any part of it) with or without notice at any time. We will not be liable to you or to any third party for any modification, suspension, or discontinuance of the service.
          </p>
          
          <h2>Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. The most current version will be posted on this page with the effective date. Your continued use of the service after any changes to the Terms constitutes your acceptance of those changes.
          </p>
          
          <h2>Termination</h2>
          <p>
            We may terminate or suspend your access to the service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms. Upon termination, your right to use the service will immediately cease.
          </p>
          
          <h2>Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at terms@temp-mail.lol.
          </p>
        </div>
      </div>
    </>
  );
};

export default TermsOfService; 