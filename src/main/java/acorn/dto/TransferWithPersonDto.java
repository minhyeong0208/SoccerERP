package acorn.dto;

import org.springframework.web.multipart.MultipartFile;

import acorn.entity.Person;
import acorn.entity.Transfer;
import lombok.Data;

@Data
public class TransferWithPersonDto {
    private Transfer transfer;
    private Person person;
    private MultipartFile file;  // 이미지 파일 추가

    // 모든 필드를 포함하는 생성자
    public TransferWithPersonDto(Transfer transfer, Person person, MultipartFile file) {
        this.transfer = transfer;
        this.person = person;
        this.file = file;
    }

    // Transfer와 Person만 받는 생성자
    public TransferWithPersonDto(Transfer transfer, Person person) {
        this.transfer = transfer;
        this.person = person;
        this.file = null;
    }

    // 기본 생성자
    public TransferWithPersonDto() {
    }
}
