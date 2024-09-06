package acorn.dto;

import acorn.entity.Transfer;
import acorn.entity.Person;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TransferWithPersonDto {
    private Transfer transfer;
    private Person person;
}
