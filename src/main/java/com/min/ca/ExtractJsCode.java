package com.min.ca; // 현재 프로젝트의 패키지명에 맞게 수정하세요.

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class ExtractJsCode {
    public static void main(String[] args) {
        
        // 1. 추출을 원하는 폴더 경로를 지정하세요 (예: src/main/resources/static)
        String targetPath = "src/main/frontend/church-attendance/src/components";  

        System.out.println(">>> JS 코드 추출을 시작합니다...");
        
        // 프로젝트 루트 경로 (자동 감지)
        String projectRoot = System.getProperty("user.dir");
        Path sourceDir = Paths.get(projectRoot, targetPath);
        
        // 결과가 저장될 텍스트 파일 이름
        File outputFile = new File("all_js_code.txt");

        try (BufferedWriter writer = new BufferedWriter(new FileWriter(outputFile))) {
            
            if (!Files.exists(sourceDir)) {
                System.err.println("오류: 경로를 찾을 수 없습니다 -> " + sourceDir.toAbsolutePath());
                return;
            }

            // 지정된 폴더 안의 폴더까지 모두 탐색하여 .js 파일만 필터링
            List<Path> jsFiles;
            try (Stream<Path> paths = Files.walk(sourceDir)) { // Files.walk()를 사용하여 하위 폴더까지 재귀적으로 탐색합니다[cite: 5].
                jsFiles = paths
                        .filter(Files::isRegularFile)
                        .filter(p -> p.toString().endsWith(".js")) // JS 파일 조건
                        .sorted()
                        .collect(Collectors.toList());
            }

            System.out.println(">>> 총 " + jsFiles.size() + "개의 JS 파일을 발견했습니다.");

            int count = 1;
            for (Path file : jsFiles) {
                String fileName = file.getFileName().toString();
                // 파일 내용 읽기[cite: 5]
                String content = Files.readString(file);

                // 2. 요청하신 포맷으로 작성
                writer.write(count + ". " + fileName + "=\"\n");
                writer.write(content);
                writer.write("\n\",\n\n"); 
                
                System.out.println("처리 중... " + fileName);
                count++;
            }

            System.out.println("------------------------------------------------");
            System.out.println("성공! 파일이 생성되었습니다: " + outputFile.getAbsolutePath());
            System.out.println("프로젝트 폴더에서 'all_js_code.txt' 파일을 확인하세요.");

        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}