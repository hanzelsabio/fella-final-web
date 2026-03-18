const ContactGoogleMap = ({ embedUrl }) => {
  if (!embedUrl) return null;

  return (
    <div>
      <iframe
        title="google map"
        src={embedUrl}
        width="100%"
        height="450"
        className="mx-auto"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
};

export default ContactGoogleMap;
