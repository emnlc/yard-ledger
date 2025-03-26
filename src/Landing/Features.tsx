const Features = () => {
  return (
    <>
      <div className="flex flex-col gap-16 md:gap-32 mt-16 md:mt-48 lg:mt-72 mx-2 md:container pb-32">
        {/* FEATURE 1 */}
        <section className="flex flex-col md:flex-row items-center md:justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-8 flex-1">
            <h1 className="text-4xl font-medium">Client Management</h1>

            <div className="flex flex-col gap-4 text-base md:text-lg font-normal text-center md:text-start">
              <p>
                Easily add, update, and remove clients as your business grows.
              </p>
              <p>
                Keep all client details organized in one place for quick access.
              </p>
            </div>
          </div>

          <div className="flex-1">
            <img className="px-4 md:px-0" src="clients.png" alt="" />
          </div>
        </section>

        {/* FEATURE 2 */}
        <section className="flex flex-col md:flex-row-reverse items-center md:justify-between gap-8">
          <div className="flex flex-col items-center md:items-end gap-8 flex-1">
            <h1 className="text-4xl font-medium">Invoice Creation</h1>

            <div className="flex flex-col gap-4 text-base md:text-lg font-normal text-center md:text-end">
              <p>Generate invoices for each client on a monthly basis.</p>
              <p>Simple and intuitive form to input invoice details quickly.</p>
            </div>
          </div>

          <div className="flex-1">
            <img className="px-4 md:px-0" src="monthly.png" alt="" />
          </div>
        </section>

        {/* FEATURE 3 */}
        <section className="flex flex-col md:flex-row items-center gap-16">
          <div className="flex flex-col justify-center   items-center gap-8 flex-1">
            <h1 className="text-4xl font-medium text-center">
              PDF Generation & Download
            </h1>

            <div className="flex flex-col gap-4 text-base md:text-lg font-normal text-center">
              <p className="text-center">
                Convert invoices into professional-looking PDFs with one click.
              </p>
              <p className="text-center">
                Ready-to-send invoices that maintain a clean and polished
                layout.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center  items-center md:items-center gap-8 flex-1">
            <h1 className="text-4xl font-medium text-center">
              Invoice History & Tracking
            </h1>

            <div className="flex flex-col gap-4 text-base md:text-lg font-normal text-center ">
              <p className="text-center">
                View all past invoices for each client in one place.
              </p>
              <p className="text-center">
                Keep a clear record of billing history for easy reference.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Features;
