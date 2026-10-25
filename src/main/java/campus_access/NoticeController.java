
package campus_access;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notices")
public class NoticeController {

    @PostMapping(value = "/analyze", consumes = "text/plain", produces = "application/json")
    public Map<String, Object> analyzeNotice(
            @RequestBody String notice) {

        if (notice == null || notice.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Please enter a college notice.");
        }

        String summary = notice.length() > 500
                ? notice.substring(0, 500) + "..."
                : notice;

        List<String> dates = new ArrayList<>();
        List<String> actions = new ArrayList<>();

        for (String sentence : notice.split("[\\n.!?]+")) {
            String line = sentence.trim();

            if (line.matches(".*\\b\\d{1,2}[/.-]\\d{1,2}[/.-]\\d{2,4}\\b.*")
                    || line.matches(".*\\b\\d{1,2}\\s+[A-Za-z]+\\s+\\d{4}\\b.*")) {
                dates.add(line);
            }

            if (line.toLowerCase().matches(
                    ".*\\b(submit|register|attend|bring|upload|complete|pay|report|contact)\\b.*")) {
                actions.add(line);
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("summary", summary);
        result.put("dates", dates);
        result.put("actions", actions);

        return result;
    }
}
