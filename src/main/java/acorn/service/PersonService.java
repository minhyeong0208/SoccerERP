package acorn.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import acorn.entity.Person;
import acorn.repository.PersonRepository;

import java.util.Optional;

@Service
public class PersonService {

    private final PersonRepository personRepository;

    @Autowired
    public PersonService(PersonRepository personRepository) {
        this.personRepository = personRepository;
    }

    // 모든 사람 조회 (페이징 처리)
    public Page<Person> getAllPersons(Pageable pageable) {
        return personRepository.findAll(pageable);
    }

    // 특정 사람 조회
    public Person getPersonById(int personIdx) {
        Optional<Person> person = personRepository.findById(personIdx);
        return person.orElse(null);
    }

    // 새로운 사람 추가
    public Person addPerson(Person person) {
        return personRepository.save(person);
    }

    // 사람 업데이트
    public Person updatePerson(int personIdx, Person personDetails) {
        Person person = getPersonById(personIdx);
        if (person != null) {
            person.setPersonName(personDetails.getPersonName());
            // 다른 필드도 업데이트 처리
            return personRepository.save(person);
        }
        return null;
    }

    // 사람 삭제
    public void deletePerson(int personIdx) {
        personRepository.deleteById(personIdx);
    }
}
