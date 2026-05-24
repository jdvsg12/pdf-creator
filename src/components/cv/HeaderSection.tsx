import React, { useState, useEffect } from 'react';
import type { CVData } from '../../lib/parsePdf';

interface HeaderSectionProps {
  data: CVData;
  onChange?: (data: Partial<CVData>) => void;
  viewMode?: boolean;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({ data, onChange, viewMode = false }) => {
  const [name, setName] = useState(data.name || '');
  const [title, setTitle] = useState(data.title || '');
  const [email, setEmail] = useState(data.contact.email || '');
  const [phone, setPhone] = useState(data.contact.phone || '');
  const [linkedin, setLinkedin] = useState(data.contact.linkedin || '');
  const [github, setGithub] = useState(data.contact.github || '');
  const [location, setLocation] = useState(data.contact.location || '');

  useEffect(() => {
    setName(data.name || '');
    setTitle(data.title || '');
    setEmail(data.contact.email || '');
    setPhone(data.contact.phone || '');
    setLinkedin(data.contact.linkedin || '');
    setGithub(data.contact.github || '');
    setLocation(data.contact.location || '');
  }, [data.name, data.title, data.contact.email, data.contact.phone, data.contact.linkedin, data.contact.github, data.contact.location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name: fieldName, value } = e.target;
    if (onChange) {
      switch (fieldName) {
        case 'name':
          setName(value);
          onChange({ name: value });
          break;
        case 'title':
          setTitle(value);
          onChange({ title: value });
          break;
        case 'email':
          setEmail(value);
          onChange({ contact: { ...data.contact, email: value } });
          break;
        case 'phone':
          setPhone(value);
          onChange({ contact: { ...data.contact, phone: value } });
          break;
        case 'linkedin':
          setLinkedin(value);
          onChange({ contact: { ...data.contact, linkedin: value || undefined } });
          break;
        case 'github':
          setGithub(value);
          onChange({ contact: { ...data.contact, github: value || undefined } });
          break;
        case 'location':
          setLocation(value);
          onChange({ contact: { ...data.contact, location: value || undefined } });
          break;
      }
    }
  };

  if (viewMode) {
    return (
      <header className="header-section">
        <div className="header-content">
          <div className="header-text">
            <h1 className="name">{name}</h1>
            <h2 className="title">{title}</h2>
          </div>
          <div className="header-contact">
            {email && <a href={`mailto:${email}`} className="contact-item">
              <svg className="icon" role="presentation" aria-hidden="true">
                <use href="/icons.svg#email-icon"></use>
              </svg>
              <span>{email}</span>
            </a>}
            {phone && <span className="contact-item">
              <svg className="icon" role="presentation" aria-hidden="true">
                <use href="/icons.svg#phone-icon"></use>
              </svg>
              <span>{phone}</span>
            </span>}
            {location && <span className="contact-item">
              <svg className="icon" role="presentation" aria-hidden="true">
                <use href="/icons.svg#location-icon"></use>
              </svg>
              <span>{location}</span>
            </span>}
            {linkedin && <a href={linkedin} target="_blank" rel="noopener noreferrer" className="contact-item">
              <svg className="icon" role="presentation" aria-hidden="true">
                <use href="/icons.svg#linkedin-icon"></use>
              </svg>
              <span>LinkedIn</span>
            </a>}
            {github && <a href={github} target="_blank" rel="noopener noreferrer" className="contact-item">
              <svg className="icon" role="presentation" aria-hidden="true">
                <use href="/icons.svg#github-icon"></use>
              </svg>
              <span>GitHub</span>
            </a>}
          </div>
        </div>
      </header>
    );
  }

  return (
    <section className="header-section">
      <h2 className="section-title">Header</h2>
      <div className="form-group">
        <label>Full Name:</label>
        <input
          type="text"
          value={name}
          onChange={handleChange}
          name="name"
          placeholder="Your full name"
        />
      </div>
      <div className="form-group">
        <label>Professional Title:</label>
        <input
          type="text"
          value={title}
          onChange={handleChange}
          name="title"
          placeholder="e.g., Frontend Developer"
        />
      </div>
      <div className="form-group">
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={handleChange}
          name="email"
          placeholder="your.email@example.com"
        />
      </div>
      <div className="form-group">
        <label>Phone:</label>
        <input
          type="tel"
          value={phone}
          onChange={handleChange}
          name="phone"
          placeholder="+1 (555) 123-4567"
        />
      </div>
      <div className="form-group">
        <label>Location (City, Country):</label>
        <input
          type="text"
          value={location}
          onChange={handleChange}
          name="location"
          placeholder="New York, USA"
        />
      </div>
      <div className="form-group">
        <label>LinkedIn (URL):</label>
        <input
          type="url"
          value={linkedin}
          onChange={handleChange}
          name="linkedin"
          placeholder="https://linkedin.com/in/yourprofile"
        />
      </div>
      <div className="form-group">
        <label>GitHub (URL):</label>
        <input
          type="url"
          value={github}
          onChange={handleChange}
          name="github"
          placeholder="https://github.com/yourusername"
        />
      </div>
    </section>
  );
};