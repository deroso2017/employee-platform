package com.ronitech.employee_platform.service;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    private final Path uploadDirectory = Paths.get("uploads/employees");

    public String store(MultipartFile file, Long employeeId)
            throws IOException {

        Files.createDirectories(uploadDirectory);

        String originalFilename = file.getOriginalFilename();

        String extension = "";

        if (originalFilename != null &&
                originalFilename.contains(".")) {

            extension = originalFilename.substring(
                    originalFilename.lastIndexOf("."));
        }

        String filename = employeeId + "-profile" + extension;

        Path target = uploadDirectory.resolve(filename);

        Files.write(
                target,
                file.getBytes());

        return filename;
    }

    public byte[] load(String filename) throws IOException {

        Path file = uploadDirectory.resolve(filename);

        if (!Files.exists(file)) {
            throw new FileNotFoundException(
                    "File not found: " + filename);
        }

        return Files.readAllBytes(file);
    }

}