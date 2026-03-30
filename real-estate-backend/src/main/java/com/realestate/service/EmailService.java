package com.realestate.service;

import com.realestate.entity.NewsEvent;
import com.realestate.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${spring.application.name:RealEstate Pro}")
    private String appName;

    /**
     * Sends a news/event notification email to a batch of users asynchronously.
     */
    @Async
    public void sendNewsEventNotification(NewsEvent newsEvent, List<User> recipients) {
        for (User user : recipients) {
            try {
                sendToUser(newsEvent, user);
            } catch (Exception e) {
                log.error("Failed to send email to {}: {}", user.getEmail(), e.getMessage());
            }
        }
    }

    private void sendToUser(NewsEvent newsEvent, User user) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(user.getEmail());

        boolean isEvent = newsEvent.getType().name().equals("EVENT");
        String typeLabel = isEvent ? "Event" : "News";
        String publicUrl = frontendUrl + "/news/" + newsEvent.getId();

        helper.setSubject("[" + appName + "] New " + typeLabel + ": " + newsEvent.getTitle());
        helper.setText(buildHtmlEmail(newsEvent, user, publicUrl, typeLabel, isEvent), true);

        mailSender.send(message);
        log.info("News/Event email sent to {}", user.getEmail());
    }

    private String buildHtmlEmail(NewsEvent newsEvent, User user, String publicUrl,
                                   String typeLabel, boolean isEvent) {
        String badgeColor = isEvent ? "#7c3aed" : "#0ea5e9";
        String eventDetails = "";
        if (isEvent && newsEvent.getEventDate() != null) {
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' h:mm a");
            eventDetails = "<div style='margin:16px 0;padding:16px;background:#f0f9ff;border-left:4px solid #0ea5e9;border-radius:4px;'>"
                    + "<p style='margin:0 0 6px;font-weight:600;color:#0369a1;'>📅 Event Details</p>"
                    + "<p style='margin:0;color:#334155;font-size:14px;'><b>Date & Time:</b> " + newsEvent.getEventDate().format(fmt) + "</p>"
                    + (newsEvent.getLocation() != null && !newsEvent.getLocation().isBlank()
                    ? "<p style='margin:6px 0 0;color:#334155;font-size:14px;'><b>Location:</b> " + newsEvent.getLocation() + "</p>" : "")
                    + "</div>";
        }

        String summary = (newsEvent.getSummary() != null && !newsEvent.getSummary().isBlank())
                ? newsEvent.getSummary()
                : newsEvent.getContent().length() > 200
                ? newsEvent.getContent().substring(0, 200) + "..."
                : newsEvent.getContent();

        return "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style='margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;'>"
                + "<table width='100%' cellpadding='0' cellspacing='0'><tr><td align='center' style='padding:32px 16px;'>"
                + "<table width='600' cellpadding='0' cellspacing='0' style='background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);'>"

                // Header
                + "<tr><td style='background:linear-gradient(135deg,#1e293b 0%,#334155 100%);padding:32px 40px;text-align:center;'>"
                + "<h1 style='margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;'>🏠 " + appName + "</h1>"
                + "<p style='margin:8px 0 0;color:#94a3b8;font-size:14px;'>Real Estate Management System</p>"
                + "</td></tr>"

                // Badge
                + "<tr><td style='padding:32px 40px 16px;'>"
                + "<span style='display:inline-block;background:" + badgeColor + ";color:#fff;font-size:12px;font-weight:700;letter-spacing:1px;padding:4px 12px;border-radius:999px;text-transform:uppercase;'>"
                + typeLabel + "</span>"
                + "</td></tr>"

                // Title
                + "<tr><td style='padding:0 40px 16px;'>"
                + "<h2 style='margin:0;color:#0f172a;font-size:22px;font-weight:700;line-height:1.3;'>" + newsEvent.getTitle() + "</h2>"
                + "</td></tr>"

                // Summary
                + "<tr><td style='padding:0 40px 16px;'>"
                + "<p style='margin:0;color:#475569;font-size:15px;line-height:1.7;'>" + summary + "</p>"
                + "</td></tr>"

                // Event details (only for events)
                + "<tr><td style='padding:0 40px 16px;'>" + eventDetails + "</td></tr>"

                // CTA Button
                + "<tr><td style='padding:8px 40px 32px;text-align:center;'>"
                + "<a href='" + publicUrl + "' style='display:inline-block;background:#2563eb;color:#ffffff;font-size:15px;font-weight:600;padding:14px 36px;border-radius:8px;text-decoration:none;letter-spacing:0.2px;'>"
                + "Read Full " + typeLabel + " →"
                + "</a>"
                + "</td></tr>"

                // Greeting
                + "<tr><td style='padding:0 40px 8px;'>"
                + "<p style='margin:0;color:#64748b;font-size:14px;'>Hi <b>" + user.getFirstName() + "</b>, this " + typeLabel.toLowerCase() + " was published by the " + appName + " admin team.</p>"
                + "</td></tr>"

                // Footer
                + "<tr><td style='background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;'>"
                + "<p style='margin:0;color:#94a3b8;font-size:12px;'>You are receiving this because you are a registered user of " + appName + ".<br>"
                + "© 2025 " + appName + ". All rights reserved.</p>"
                + "</td></tr>"

                + "</table></td></tr></table></body></html>";
    }
}
