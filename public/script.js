document.addEventListener("alpine:init", () => {
  Alpine.data("landingPage", () => ({
    scrolled: false,
    mobileMenu: false,
    chatOpen: false,
    chatMessages: [],
    chatInput: "",
    chatLoading: false,
    submitted: false,
    form: {
      name: "",
      email: "",
      company: "",
      message: "",
      consent: false,
    },
    errors: {},

    init() {
      this.updateNavState();
      window.addEventListener("scroll", () => {
        this.updateNavState();
      });

      const yearNode = document.getElementById("current-year");
      if (yearNode) {
        yearNode.textContent = String(new Date().getFullYear());
      }
    },

    updateNavState() {
      this.scrolled = window.scrollY > 8;
    },

    toggleChat() {
      this.chatOpen = !this.chatOpen;
    },

    closeChat() {
      this.chatOpen = false;
    },

    async sendChatMessage() {
      const text = this.chatInput;
      if (!text || this.chatLoading) return;

      this.chatInput = "";
      this.chatMessages.push({ role: "user", text });
      this.chatLoading = true;
      this.$nextTick(() => this._scrollChat());

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversation: this.chatMessages }),
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data = await res.json();
        this.chatMessages.push({
          role: "model",
          text: data.result || "Maaf, tidak ada respons.",
        });
      } catch (err) {
        console.error("Chat error:", err);
        this.chatMessages.push({
          role: "model",
          text: "Maaf, terjadi kesalahan. Silakan coba lagi.",
        });
      } finally {
        this.chatLoading = false;
        this.$nextTick(() => this._scrollChat());
      }
    },

    _scrollChat() {
      const el = this.$refs.chatMessages;
      if (el) el.scrollTop = el.scrollHeight;
    },

    isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    submitForm() {
      this.errors = {};
      this.submitted = false;

      if (!this.form.name) {
        this.errors.name = "Please enter your full name.";
      }

      if (!this.form.email) {
        this.errors.email = "Please enter your work email.";
      } else if (!this.isValidEmail(this.form.email)) {
        this.errors.email = "Please provide a valid email address.";
      }

      if (!this.form.message) {
        this.errors.message = "Please describe your needs.";
      } else if (this.form.message.length < 20) {
        this.errors.message = "Please provide at least 20 characters.";
      }

      if (!this.form.consent) {
        this.errors.consent =
          "Please provide consent so our team can contact you.";
      }

      if (Object.keys(this.errors).length > 0) {
        return;
      }

      this.submitted = true;
      this.form = {
        name: "",
        email: "",
        company: "",
        message: "",
        consent: false,
      };
    },
  }));
});
