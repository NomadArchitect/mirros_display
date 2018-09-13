module.exports =
  'export default {\n\
  backendUrl:\n\
    process.env.NODE_ENV === "production"\n\
      ? "/api/"\n\
      : `http://${window.location.hostname}:3000`\n\
};';
