package acorn.dto;

import org.springframework.web.multipart.MultipartFile;

import acorn.entity.Person;
import acorn.entity.Transfer;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TransferWithPersonDto {
    private Transfer transfer;
    private Person person;
    private MultipartFile file;  // 이미지 파일 추가
}
