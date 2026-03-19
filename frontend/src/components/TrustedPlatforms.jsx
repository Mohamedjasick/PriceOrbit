function TrustedPlatforms() {

  const platforms = [
    {
      name: "Amazon",
      logo: "/amazon.png",
      desc: "India's largest online store",
      color: "#FF9900"
    },
    {
      name: "Flipkart",
      logo: "/flipkart.png",
      desc: "Best deals on electronics",
      color: "#2874F0"
    }
  ];

  return (
    <div className="trusted-section">

      <h3 style={{
        fontSize: "26px",
        fontWeight: "800",
        color: "#050d2e",
        marginBottom: "8px",
        fontFamily: "Inter, sans-serif",
        letterSpacing: "-0.02em"
      }}>
        Compare Prices From Trusted Platforms
      </h3>

      <p style={{
        color: "#6b7a99",
        fontSize: "15px",
        marginBottom: "40px",
        fontFamily: "Inter, sans-serif"
      }}>
        We compare across India's top retailers so you don't have to
      </p>

      {/* TWO PLATFORM CARDS — perfectly symmetric */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "32px",
        flexWrap: "wrap"
      }}>

        {platforms.map((platform, index) => (
          <div
            key={index}
            style={{
              width: "260px",
              padding: "40px 32px",
              borderRadius: "16px",
              background: "white",
              border: "1.5px solid rgba(26,60,255,0.1)",
              boxShadow: "0 4px 20px rgba(26,60,255,0.07)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              transition: "all 0.25s ease",
              cursor: "default"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.boxShadow = "0 16px 48px rgba(26,60,255,0.13)";
              e.currentTarget.style.borderColor = platform.color + "44";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(26,60,255,0.07)";
              e.currentTarget.style.borderColor = "rgba(26,60,255,0.1)";
            }}
          >

            {/* LOGO BOX */}
            <div style={{
              width: "80px",
              height: "80px",
              borderRadius: "16px",
              background: "#f5f6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "12px",
              boxSizing: "border-box"
            }}>
              <img
                src={platform.logo}
                alt={platform.name}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>

            {/* NAME */}
            <p style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "700",
              color: "#050d2e",
              fontFamily: "Inter, sans-serif"
            }}>
              {platform.name}
            </p>

            {/* DESC */}
            <p style={{
              margin: 0,
              fontSize: "13px",
              color: "#6b7a99",
              fontFamily: "Inter, sans-serif",
              textAlign: "center",
              lineHeight: "1.5"
            }}>
              {platform.desc}
            </p>

            {/* COLORED TAG */}
            <span style={{
              padding: "4px 14px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "600",
              fontFamily: "Inter, sans-serif",
              backgroundColor: platform.color + "18",
              color: platform.color,
              border: `1px solid ${platform.color}33`
            }}>
              Live Prices
            </span>

          </div>
        ))}

      </div>
    </div>
  );
}

export default TrustedPlatforms;

